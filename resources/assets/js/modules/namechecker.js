var nameChecker;
var NameChecker = (function () {
    function NameChecker() {
        this.elements = {};
        this.form = {};
        this.notAllowed = [];
        this.paths = {};
        this.elements = {
            availability: '#rsn-availability',
            check: '#rsn-check-field'
        };
        this.notAllowed = ['ZnVjaw==', 'c2hpdA=='];
        this.paths = {
            check: '/name-check'
        };
        this.setForm();
    }
    NameChecker.prototype.setForm = function () {
        this.form = document.getElementById('namechecker-form');
        new stepsForm(this.form, {
            onSubmit: function () {
                var username = $('#q1').val();
                var data = {
                    rsn: username
                };
                var results = utilities.postAJAX(nameChecker.paths.check, data);
                results.done(function (results) {
                    var classSet = nameChecker.form.querySelector('.simform-inner');
                    classie.addClass(classSet, 'hide');
                    var el = nameChecker.form.querySelector('.final-message');
                    var message = 'The Runescape name <b>' + username + '</b> is ';
                    if (results.substring(0, 6) === "<!DOCT") {
                        message += 'available.';
                    }
                    else {
                        message += 'unavailable.';
                    }
                    message += "<br /><a href='/name-check' class='btn btn-primary'>Search Again</a>";
                    el.innerHTML = message;
                    classie.addClass(el, 'show');
                });
            }
        });
    };
    return NameChecker;
})();
