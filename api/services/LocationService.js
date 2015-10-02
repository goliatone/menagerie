var contactsRepo = require('../../init-data/location.js');
//import contactsList from '/init-data/contacts';

module.exports = {
    preloadData: function (_next) {
        console.log(">>>>>>>>>>>>>>> preloading data.......");

        Contact.findOrCreateEach(["uuid"], contactsRepo.records).then(function (_records) {
            console.log("Contact created: " + JSON.stringify(_records));
            if (_next) {
                _next(_records);
            }
        }).catch(function (err) {
            console.error("Error on LocationService.preloadData");
            console.error(err);
            console.error(JSON.stringify(err));
        });

    }
};
