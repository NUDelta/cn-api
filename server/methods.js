Meteor.methods({
  getEmails: function(users) {
    let emails = [];
    users.forEach((user) => {
      emails.push(Meteor.users.findOne(user).emails[0]);
    });
    return users;
  },
  updateUserExperiences: function(userId) {
    // TODO: Figure out if it's possible to turn this into an efficent Mongo query
    let user = Meteor.users.findOne(userId);
    //console.log(user);
    let exps = Experiences.find().fetch().filter((doc) => {
      let match = true;
      doc.requirements.forEach((req) => {
        if (!user.profile.qualifications[req]) {
          match = false;
        }
      });
      return match;
    }).map((doc) => {
      return doc._id;
    });
    Meteor.users.update(userId, {$set: {'profile.experiences': exps}});
    let subs = user.profile.subscriptions;
    subs = subs.filter((sub) => {
      return _.contains(exps, sub);
    });
    Meteor.users.update(userId, {$set: {'profile.subscriptions': subs}});
  },
  getExperiences: function(params1 = {}, params2 = {}) {
    return Experiences.find(params1, params2).fetch();
  },
  getUsers: function(params1 = {}, params2 = {}) {
    return Meteor.users.find(params1, params2).fetch();
  },
  getSubscriptions: function(userId) {
    return Meteor.users.findOne(userId, { fields: { 'profile.subscriptions': 1 }});
  },
  insertPhoto: function(experienceId, picture, title='upload.png') {
    let newFile = new FS.File();
    newFile.attachData(new Buffer(picture, 'base64'), { type: 'image/png' }, function(error) {
      if (error) throw error;

      newFile.name(title);
      let image = Images.insert(newFile);
      image = Images.findOne(image._id);
      Images.update({ _id: image._id }, {$set : { experience: experienceId }});
    });
    return picture;
  },
  getPhotos: function(experienceId) {
    let pics = [];
    Images.find({experience: experienceId}).forEach((pic) => {
      pics.push(Util.getBase64Data(pic));
    });
    return pics
  }
 });
