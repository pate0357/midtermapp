var contactList;
var testObject = [];
var errorDiv;
var currentContact;

var app = {
    init: function () {

        document.querySelector("[data-role=modal]").style.display = "none";
        document.querySelector("[data-role=overlay]").style.display = "none";
        document.getElementById("Cancle").addEventListener("click", app.Cancle);

//        document.getElementById("set").style.display = "none";
//        document.getElementById("set").addEventListener("click", app.init);
        //        contactJS.getContacts();
        var jsonObject = localStorage.getItem('testObject');
        contactList = JSON.parse(jsonObject);

        if (!contactList) {
            app.getContacts();
        } else {

            app.addContactListElement(contactList);
        }
    },
    Cancle: function (ev) {
        document.querySelector("[data-role=modal]").style.display = "none";
        document.querySelector("[data-role=overlay]").style.display = "none";
    },
    edit: function (contact) {

        document.querySelector("[data-role=modal]").style.display = "block";
        document.querySelector("[data-role=overlay]").style.display = "block";
        document.querySelector(".contactName").innerHTML = contact.innerHTML;

        document.querySelector("#phonenumbers").innerHTML = "";
        var shown_name = contact.innerHTML;
        var retrievedObject = localStorage.getItem('testObject');
        data = JSON.parse(retrievedObject);
        //        console.log(data);
        for (var i = 0; i < data.length; i++) {

            if (data[i].myname == shown_name) {
                var phonenumber = data[i].number;
                for (var j = 0; j < phonenumber.length; j++) {


                    var displayli = document.createElement("li");
                    displayli.innerHTML = phonenumber[j].type + ":" + phonenumber[j].value;
                    //                    console.log(displayli);
                    document.querySelector("#phonenumbers").appendChild(displayli);

                }
            }

        }
    },

    /***This code will display contacts in the phone ***/



    getContacts: function () {
        var options = new ContactFindOptions();
        //	options.filter = "";
        //	var fields = ["displayName", "name"];
        options.multiple = true;
        var fields = [navigator.contacts.fieldType.displayName, navigator.contacts.fieldType.name, navigator.contacts.fieldType.phoneNumber];
        navigator.contacts.find(fields, app.onSuccess, app.onError, options);
    },
    onSuccess: function (contacts) {

        /*******this code will store data in the local storage*******/
        for (var i = 0; i < contacts.length; i++) {
            var contactname = contacts[i].displayName;
            var number = contacts[i].phoneNumbers;
            var jsonObject = {
                'id': i,
                'myname': contactname,
                'number': number,
                'lat': null,
                'long': null
            };
            testObject.push(jsonObject);

        }
        // Put the object into storage
        localStorage.setItem('testObject', JSON.stringify(testObject));

        // Retrieve the object from storage
        var retrievedObject = localStorage.getItem('testObject');
        newcontact = JSON.parse(retrievedObject);


        app.addContactListElement(newcontact);
    },

    addContactListElement: function (contacts) {
        document.querySelector("#MyContacts").innerHTML = "";

        for (var i = 0; i < contacts.length; i++) {
            var li = document.createElement("li");
            li.innerHTML = contacts[i].myname;
            li.setAttribute("id", contacts[i].id);
            app.addHammer(li);
            document.querySelector('#MyContacts').appendChild(li);
        }
    },

    onError: function (contactError) {
        document.querySelector("#contactLoading").innerHTML = "";
        errorDiv = document.querySelector("#err_dialog");
        if (!errorDiv) {
            errorDiv = document.createElement("div");
            errorDiv.setAttribute("id", "err_dialog");
            document.body.appendChild(errorDiv);
        }
        errorDiv.style.display = 'block';
        errorDiv.innerHTML = "Error while fetching contacts.";

        //set timeout for error msg
        setTimeout(function () {
            errorDiv.style.display = 'none';
        }, 3000); //3secs
    },

    /***this code will used for both single and double touch event ****/

    addHammer: function (element) {
        // Add Hammer double tap event
        var mc = new Hammer.Manager(element);
        // Tap recognizer with minimal 2 taps
        mc.add(new Hammer.Tap({
            event: 'doubletap',
            taps: 2
        }));
        // Single tap recognizer
        mc.add(new Hammer.Tap({
            event: 'singletap'
        }));
        // we want to recognize this simulatenous, so a quadrupletap will be detected even while a tap has been recognized.
        mc.get('doubletap').recognizeWith('singletap');
        // we only want to trigger a tap, when we don't have detected a doubletap
        mc.get('singletap').requireFailure('doubletap');

        mc.on("singletap doubletap", function (ev) {

            if (ev.type == "singletap") {
                app.edit(ev.target);
                //                app.edit(contactList[ev.target.id]);

            } else if (ev.type == "doubletap") {
                app.newmap(ev.target);
            }
        });
    },

    /*** this code will used to dispaly map ****/
    newmap: function (contacts) {
        document.querySelector("#mapPage").style.display = "block";
        document.querySelector("#contact").style.display = "none";
        app.getLocation(contacts);

    },
    getLocation: function (contact) {

        currentContact = contact;
        document.querySelector(".titleMap").innerHTML = "Location of " + contact.innerHTML;


        console.log(contact);
        var shown_name = contact.innerHTML;
        var retrievedObject = localStorage.getItem('testObject');
        data = JSON.parse(retrievedObject);

        for (var i = 0; i < data.length; i++) {


            if (data[i].myname == shown_name) {
                currentContact = data[i];

                if (data[i].lat && data[i].long) {
                    document.querySelector("#set").style.display = "none";

                    var latitude = data[i].lat;
                    var longitude = data[i].long;
                    document.querySelector("#locating").innerHTML = "";

                    var center = new google.maps.LatLng(latitude, longitude);
                    console.log(center);

                    //set map option
                    var mapOptions = {
                        zoom: 14,
                        center: center,
                        disableDoubleClickZoom: true
                    };
                    var map = new google.maps.Map(document.getElementById('map_canvas'),
                        mapOptions);
                    app.Markermake(center, map);

                } else {



                    document.querySelector("#set").style.display = "block";

                    var params = {
                            enableHighAccuracy: true,
                            timeout: 5000
                        }
                        //get current position
                    navigator.geolocation.getCurrentPosition(app.success, app.error, params);
                }
            }
        }
    },
    success: function (position) {


        document.querySelector("#locating").innerHTML = "Double click to set position.";

        var latitude = position.coords.latitude;
        var longitude = position.coords.longitude;


        var center = new google.maps.LatLng(latitude, longitude);
        console.log(center);

        //set map option
        var mapOptions = {
            zoom: 14,
            center: center,
            disableDoubleClickZoom: true
        };
        var map = new google.maps.Map(document.getElementById('map_canvas'),
            mapOptions);

        //set ONLY ONE marker on double click
        google.maps.event.addListenerOnce(map, 'dblclick', function (e) {
            //console.log(e);
            app.Markermake(e.latLng, map);
        });
        //        document.getElementById("set").addEventListener("click", app.set);
    },

    //    set: function () {
    //        document.querySelector("#contact").style.display = "block";
    //
    //
    //    },
    error: function (err) {
        alert('ERROR(' + err.code + '): ' + err.message);
    },

    Markermake: function (position, map) {

        document.querySelector("#locating").innerHTML = "";

        var marker = new google.maps.Marker({
            position: position,
            animation: google.maps.Animation.DROP,
            map: map
        });
        map.panTo(position);

        var markerLat = marker.getPosition().lat();
        var markerLong = marker.getPosition().lng();

        currentContact.lat = markerLat;
        currentContact.long = markerLong;


        //Update local storage
        var id = currentContact.id;
        data[id] = currentContact;


        // add contact to local storage
        localStorage.setItem('testObject', JSON.stringify(data));

        //        //Get contacts from storage
        var retrievedObject = localStorage.getItem('testObject');
        data = JSON.parse(retrievedObject);

    }



}

document.addEventListener("DOMContentLoaded", app.init);
document.addEventListener("deviceready", app.init);