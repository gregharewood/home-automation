define([
    "helpers/apis",
    "backbone",
    "text!templates/widgets/switch-small.html"
], function (Apis, Backbone, templateSwitch) {
    'use strict';

    return Backbone.View.extend({
        el: '#devices-container',

        initialize: function () {
            _.bindAll(this, 'render', 'getTemplate');
            var that = this;

            that.Devices = window.App.Devices;
        },
        render: function () {
            var that = this,
                model = that.model;

            that.$template = $(_.template(templateSwitch, model.toJSON()));

            if (!that.Devices.activeMode) {
                that.$template.addClass('clear');
            } else {
                that.$template.removeClass('clear');
            }

            that.listenTo(window.App.Devices, 'settings normal', function () {
                that.$template.toggleClass('clear');
            });

            that.$template.hide();

            that.listenTo(that.model, 'destroy reset', function () {
                that.$template.remove();
                that.remove();
            });

            that.listenTo(window.App.Devices, 'reset', function () {
                that.$template.remove();
                that.remove();
            });

            that.listenTo(model, 'show', function () {
                that.$template.removeClass('show').addClass('show').show('fast');
            });

            that.listenTo(model, 'hide', function () {
                that.$template.removeClass('show').hide('fast');
            });

            that.listenTo(that.model, 'change:metrics', function () {
                that.$template.find('.title-container').text(that.model.get('metrics').title);

                if (String(that.model.get('metrics').level) === 'on') {
                    that.$template.find(".action").addClass('active').attr({title: 'ON'});
                    that.$template.find(".switch-door").addClass('active');
                    that.$template.find(".switch-door").find('.text').text('ON');
                } else {
                    that.$template.find(".action").removeClass('active').attr({title: 'OFF'});
                    that.$template.find(".switch-door").removeClass('active');
                    that.$template.find(".switch-door").find('.text').text('OFF');
                }
            });

            that.$template.find('.action').on('click', function (e) {
                e.preventDefault();

                var $button = $(this),
                    command = !$button.hasClass('active') ? 'on' : 'off';

                Apis.devices.command(model.get('id'), command, {}, function () {
                    $button
                        .toggleClass('active')
                        .attr('title', command.capitalize())
                        .children()
                        .toggleClass('active')
                        .find('.text').text(command.toUpperCase());
                });
            });

            if (!$('div[data-widget-id="' + that.model.id + '"]').exists()) {
                that.$el.append(that.$template);
            } else {
                that.$el.find('div[data-widget-id="' + model.get('id') + '"]').replaceWith(that.$template);
            }
        },
        getTemplate: function () {
            return this.$template;
        }
    });
});