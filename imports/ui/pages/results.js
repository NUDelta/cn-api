import './results.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { ReactiveVar } from 'meteor/reactive-var';
import { _ } from 'meteor/underscore';

import PhotoSwipe from 'photoswipe/dist/photoswipe.min';
import PhotoSwipeUI_Default from 'photoswipe/dist/photoswipe-ui-default.min';

import { Experiences } from '../../api/experiences/experiences.js';
import { Images } from '../../api/images/images.js';
import { TextEntries } from '../../api/text-entries/text-entries.js';
import { Incidents } from '../../api/incidents/incidents.js';

import { ParticipationLocations } from '../../api/participation-locations/participation_locations.js';

Template.results.onCreated(function() {
  const incidentId = Router.current().params._id;
  
  this.subscribe('images', incidentId);
  this.subscribe('textEntries.byIncident', incidentId);
  const incHandle = this.subscribe('incidents.byId', incidentId);
  const expHandle = this.subscribe('experiences.byIncident', incidentId);

  this.state = new ReactiveDict();
  this.state.set('incidentId', incidentId);
  this.filter = new ReactiveVar({ incidentId: incidentId});

  this.autorun(() => {
    if (expHandle.ready() && incHandle.ready()) {
      const experience = Experiences.findOne();
      const incident = Incidents.findOne();
      this.state.set({
        incident: incident,
        experience: experience,
        modules: experience.modules
      });
    }
  });
});

Template.results.helpers({
  incident() {
    const instance = Template.instance();
    return instance.state.get('incident');
  },
  moduleChosen(module) {
    const instance = Template.instance();
    const modules = instance.state.get('modules');
    return _.contains(modules, module);
  },
  images() {
    const instance = Template.instance();
    return Images.find(instance.filter.get());
  },
  textEntries() {
    const instance = Template.instance();
    return TextEntries.find(instance.filter.get());
  },
  experience() {
    const instance = Template.instance();
    return instance.state.get('experience');
  },
  isActive: function() {
    const instance = Template.instance();
    return Experiences.findOne() == instance.state.get('incidentId');
  }
});

Template.results.events({
  'change #pic-dropdown'(event, instance) {
    const newValue = event.target.value;
    const newFilter = { incidentId: instance.state.get('incidentId') };

    if (newValue != instance.filter.get() && newValue != 'Anywhere') {
      newFilter.location = newValue;
    }
    instance.filter.set(newFilter);
  },
  'click img'(event, instance) {
    const galleryElement = document.getElementById('gallery');
    const items = Images.find(instance.filter.get()).fetch().map(
      (image) => {
        return {
          src: image.url(),
          w: image.metadata.width,
          h: image.metadata.height
        };
      });
    const options = {
      index: event.target.getAttribute('data-index')
    };
    const gallery = new PhotoSwipe(galleryElement, PhotoSwipeUI_Default, items, options);
    gallery.init();
  }
  // 'change #text-dropdown'(event, instance) {
  //   let newValue =  $('#text-dropdown option:selected').text();
  //   let oldValue = Session.get('textFilter');
  //   let newFilter = { incidentId: this._id };
  //
  //   if (newValue != oldValue && newValue != 'Anywhere') {
  //     // value changed, let's do something
  //     newFilter.location = newValue;
  //   }
  //
  //   console.log(newFilter);
  //   Session.set('textFilter', newFilter);
  // }
});

Template.results.onRendered(() => {
});
