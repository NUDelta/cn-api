import './profile.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Router } from 'meteor/iron:router';

Template.profile.helpers({
  pastIncidents: function () {
    return Meteor.user().profile.pastIncidents;
  }
});