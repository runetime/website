:: Modules

call tsc --out temp-admin.js modules/admin.ts

call tsc --out temp-modules.js modules/calculator.ts modules/chatbox.ts modules/combatcalculator.ts modules/forums.ts modules/livestream.ts modules/namechecker.ts modules/notifications.ts modules/radio.ts modules/signup.ts modules/staff_list.ts modules/utilities.ts


:: UglifyJS

call uglifyjs temp-admin.js -c -m -o ./../../../public/js/admin.js
call uglifyjs temp-modules.js -c -m -o ./../../../public/js/modules.js


:: Vendor
call uglifyjs vendor/jquery.js vendor/jquery-ui.js vendor/bootstrap.js vendor/jasny-bootstrap.js -c -m -o ../../../public/js/vendor.js


:: Remove temporary files

call del .\temp-admin.js
call del .\temp-modules.js