var Contacts = {
    index: window.localStorage.getItem("Contacts:index"),
    dataset: ["client", "task"],
    indexset: [],
    dateset: [],
    $table: document.getElementById("contacts-table"),
    $form: document.getElementById("contacts-form"),
    $button_save: document.getElementById("contacts-op-save"),
    $button_discard: document.getElementById("contacts-op-discard"),

    init: function () {
        // initialize storage index
        if (!Contacts.index) {
            window.localStorage.setItem("Contacts:index", Contacts.index = 1);
        }

        // initialize form
        Contacts.$form.reset();
        Contacts.$button_discard.addEventListener("click", function (event) {
            Contacts.$form.reset();
            Contacts.$form.id_entry.value = 0;
        }, true);

        Contacts.$form.addEventListener("submit", function (event) {
            var entry = {
                id: parseInt(this.id_entry.value),
                client: this.client.value,
                task: this.task.value,
                toggle: this.toggle_val.value,
                time: new Date()
            };
            if (entry.id === 0) { // add
                Contacts.storeAdd(entry);
                Contacts.tableAdd(entry);
            } else { // edit
                Contacts.storeEdit(entry);
                Contacts.tableEdit(entry);
            }

            this.reset();
            this.id_entry.value = 0;
            event.preventDefault();
        }, true);

        // initialize table
        if (window.localStorage.length - 1) {
            var contacts_list = [],
                i, key;
            for (i = 0; i < window.localStorage.length; i++) {
                key = window.localStorage.key(i);
                if (/Contacts:\d+/.test(key)) {
                    contacts_list.push(JSON.parse(window.localStorage.getItem(key)));
                    Contacts.indexset.push(key.replace("Contacts:", ""));
                    Contacts.dateset.push(contacts_list[contacts_list.length - 1].time);
                }
            }

            if (contacts_list.length) {
                contacts_list.sort(function (a, b) {
                    return a.client < b.client ? -1 : (a.client > b.client ? 1 : 0);
                })
                    .forEach(Contacts.tableAdd);
            }
        }
        Contacts.$table.addEventListener("click", function (event) {
            var op = event.target.getAttribute("data-op");
            if (/edit|remove|toggle|touch/.test(op)) {
                var entry = JSON.parse(window.localStorage.getItem("Contacts:" + event.target.getAttribute("data-id")));
                if (op == "edit") {
                    Contacts.$form.client.value = entry.client;
                    Contacts.$form.task.value = entry.task;
                    Contacts.$form.id_entry.value = entry.id;
                    Contacts.$form.toggle_val.value = entry.toggle;
                } else if (op == "remove") {
                    if (confirm('Are you sure you want to remove task ' + entry.task + '?')) {
                        
                        Contacts.storeRemove(entry);
                        Contacts.tableRemove(entry);
                    }
                } else if (op == "toggle") {
                    if (entry.toggle == "mine") {
                        entry.toggle = "theirs";
                    } else {
                        entry.toggle = "mine";
                    }
                    entry.time = new Date();
                    Contacts.storeEdit(entry);
                    Contacts.tableEdit(entry);
                } else if (op == "touch") {
                    entry.time = new Date();
                    Contacts.storeEdit(entry);
                    Contacts.tableEdit(entry);
                }
                event.preventDefault();
            }
        }, true);
    },

    storeAdd: function (entry) {
        entry.id = Contacts.index;
        window.localStorage.setItem("Contacts:index", ++Contacts.index);
        window.localStorage.setItem("Contacts:" + entry.id, JSON.stringify(entry));
        console.log("adding entry");
        console.log("before: " + Contacts.indexset);
        Contacts.indexset.push(entry.id);
        console.log("after: " + Contacts.indexset);
        Contacts.dateset.push(entry.time);
    },
    storeEdit: function (entry) {
        window.localStorage.setItem("Contacts:" + entry.id, JSON.stringify(entry));
        var a = Contacts.indexset.indexOf(entry.id.toString());
        console.log("updating entry " + entry.id + " - #" + a + " in sequence");
        console.log("before: " + Contacts.dateset);
        Contacts.dateset[a] = entry.time;
        console.log("after: " + Contacts.dateset);
    },
    storeRemove: function (entry) {
        var a = Contacts.indexset.indexOf(entry.id); 
        console.log("removing entry " + entry.id + " - #" + a + " in sequence");
        console.log("before: " + Contacts.indexset);
        Contacts.indexset.splice(a, 1);
        console.log("after: " + Contacts.indexset);
        Contacts.dateset.splice(a, 1);
        window.localStorage.removeItem("Contacts:" + entry.id);
    },

    tableAdd: function (entry) {
        var $tr = document.createElement("tr"),
            $td, key;
        for (var i = 0; i < Contacts.dataset.length; i++) {
            if (entry.hasOwnProperty(Contacts.dataset[i])) {
                $td = document.createElement("td");
                $td.appendChild(document.createTextNode(entry[Contacts.dataset[i]]));
                $tr.appendChild($td);
            }
        }
        if (entry.hasOwnProperty("toggle")) {
            $td = document.createElement("td");
            $td.innerHTML = '<a data-op="toggle" data-id="' + entry.id + '">' + entry.toggle + '</a>';
            $tr.appendChild($td);
            $td.setAttribute("class", entry.toggle);
        }
        if (entry.hasOwnProperty("time")) {
            $td = document.createElement("td");
            $td.innerHTML = '<a id="time-' + entry.id + '" data-op="touch" data-id="' + entry.id + '">' + Contacts.hoursSince(entry.time) + '</a>';
            $td.setAttribute("class", "time");
            $tr.appendChild($td);
        }
        $td = document.createElement("td");
        $td.innerHTML = '<a data-op="edit" data-id="' + entry.id + '">Edit</a> | <a data-op="remove" data-id="' + entry.id + '">Remove</a>';
        $tr.appendChild($td);
        $tr.setAttribute("id", "entry-" + entry.id);
        Contacts.$table.appendChild($tr);
    },
    tableEdit: function (entry) {
        var $tr = document.getElementById("entry-" + entry.id),
            $td, key;
        $tr.innerHTML = "";
        for (var i = 0; i < Contacts.dataset.length; i++) {
            if (entry.hasOwnProperty(Contacts.dataset[i])) {
                $td = document.createElement("td");
                $td.appendChild(document.createTextNode(entry[Contacts.dataset[i]]));
                $tr.appendChild($td);
            }
        }
        if (entry.hasOwnProperty("toggle")) {
            $td = document.createElement("td");
            $td.innerHTML = '<a data-op="toggle" data-id="' + entry.id + '">' + entry.toggle + '</a>';
            $tr.appendChild($td);
            $td.setAttribute("class", entry.toggle);
        }
        if (entry.hasOwnProperty("time")) {
            $td = document.createElement("td");
            $td.innerHTML = '<a id="time-' + entry.id + '" data-op="touch" data-id="' + entry.id + '">' + Contacts.hoursSince(entry.time) + '</a>';
            $td.setAttribute("class", "time");
            $tr.appendChild($td);
        }
        $td = document.createElement("td");
        $td.innerHTML = '<a data-op="edit" data-id="' + entry.id + '">Edit</a> | <a data-op="remove" data-id="' + entry.id + '">Remove</a>';
        $tr.appendChild($td);
    },
    tableRemove: function (entry) {
        Contacts.$table.removeChild(document.getElementById("entry-" + entry.id));
    },

    hoursSince: function (day) {
        day = new Date(day);
        var today = new Date();
        date1_unixtime = parseInt(day.getTime() / 1000);
        date2_unixtime = parseInt(today.getTime() / 1000);
        var timeDifference = date2_unixtime - date1_unixtime;
        var timeDifferenceInMins = timeDifference / 60;
        var timeDifferenceInHours = timeDifference / 60 / 60;
        if (timeDifference < 60) {
            return Math.floor(timeDifference) + 's';
        } else if (timeDifferenceInMins < 61) {
            return Math.floor(timeDifferenceInMins) + 'm';
        } else if (timeDifferenceInHours < 25) {
            return Math.floor(timeDifferenceInHours) + 'h';
        } else {
            // in days
            var timeDifferenceInDays = timeDifferenceInHours / 24;
            return Math.floor(timeDifferenceInDays) + 'd';
        }
    },
    updateClock: function () {

        for (i = 0; i < Contacts.indexset.length; i++) {
            var newtime = Contacts.hoursSince(Contacts.dateset[i]);
            var $el = document.getElementById("time-" + Contacts.indexset[i]);
            $el.innerHTML = newtime;
            $el.parentNode.setAttribute("class", "time" + newtime);
        }
        $el = document.getElementById("clock");
        $el.innerHTML = new Date().toLocaleTimeString();
    }
};

Contacts.init();
window.setInterval(function () {
    Contacts.updateClock()
}, 1000);