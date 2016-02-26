Template.profileSettings.helpers({
  hasCamera: function() {
    return Meteor.user().profile.qualifications.hasCamera;
  },
  hasDog: function() {
    return Meteor.user().profile.qualifications.hasDog;
  }
});

Template.profileSettings.events({
  'submit .profile-settings': function (event) {
    event.preventDefault();
    Meteor.users.update(Meteor.userId(), {
      $set: {
        'profile.qualifications.hasCamera': event.currentTarget.camera.checked,
        'profile.qualifications.hasDog': event.currentTarget.dog.checked
      }});
    Meteor.call('updateUserExperiences', Meteor.userId());
  }
});
