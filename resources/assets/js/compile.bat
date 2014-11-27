:: Modules

call tsc --out ../../../public/js/compiled.js modules/calculator.ts modules/chatbox.ts modules/combatcalculator.ts modules/forums.ts modules/livestream.ts modules/namechecker.ts modules/notifications.ts modules/radio.ts modules/signup.ts modules/staff_list.ts modules/utilities.ts

call tsc --out ../../../public/js/admin.js modules/admin.ts


:: Vendor
uglifyjs vendor/jquery.js vendor/jquery-ui.js vendor/bootstrap.js vendor/jasny-bootstrap.js -c -m -o ../../../public/js/vendor.js