var calculator;
class Calculator {
    calculator: any;
    elements: any = {};
    info: any = {};
    URL: any = {};
    items: any = {};
    constructor(public calc: any) {
        this.elements = {
            currentXP: '#calculator-current-xp',
            displayName: '#calculator-display-name',
            submit: '#calculator-submit',
            table: '#calculator-table tbody',
            targetLevel: '#calculator-target-level'
        };
        this.URL = {
            getCalc: '/calculators/load',
            getInfo: '/get/hiscore'
        };
        this.info = {
            levelCurrent: 0,
            levelTarget: 0,
            XPCurrent: 0,
            XPTarget: 0
        };
        this.calculator = calc;
        $(this.elements.submit).bind('click', function () {
            calculator.getInfo();
        });
        this.loadCalc();
        $('#calculator-target-level').keyup(function() {
            setTimeout(function() {
                calculator.updateCalc();
            }, 25);
        });
    }

	calculateXP(level: number) {
		var total = 0,
			i = 0;
		for (i = 1; i < level; i += 1) {
			total += Math.floor(i + 300 * Math.pow(2, i / 7.0));
		}
		return Math.floor(total / 4);
	}

	calculateLevel(xp: number) {
		var total = 0,
			i = 0;
		for (i = 1; i < 120; i += 1) {
			total += Math.floor(i + 300 + Math.pow(2, i / 7));
			if(Math.floor(total / 4) > xp)
				return i;
			else if(i >= 99)
				return 99;
		}
	}

    getInfo() {
        var name = $(this.elements.displayName).val();
		var info = utilities.getAJAX(this.URL.getInfo + '/' + name);
		info.done(function(info: any) {
			info = $.parseJSON(info);
			var relevant = info[13];
			calculator.info.levelCurrent = relevant[1];
			calculator.info.XPCurrent = relevant[2];
			$(calculator.elements.currentXP).val(calculator.info.XPCurrent);
			if($(calculator.elements.targetLevel).val().length === 0) {
				$(calculator.elements.targetLevel).val(parseInt(calculator.info.levelCurrent, 10) + 1);
			}
			calculator.updateCalc();
		});
    }

    loadCalc() {
        var data = {id: this.calculator};
        var info = utilities.postAJAX(this.URL.getCalc, data);
        info.done(function(info) {
            info = utilities.JSONDecode(info);
            calculator.items = info;
            $.each(calculator.items, function (index, value) {
                var html = "";
                html += "<tr>";
                html += "<td>" + calculator.items[index].name + "</td>";
                html += "<td>" + calculator.items[index].level + "</td>";
                html += "<td>" + calculator.items[index].xp + "</td>";
                html += "<td>&infin;</td>";
                html += "</tr>";
                $(calculator.elements.table).append(html);
            });
        });
    }

    updateCalc() {
        var levelCurrent = 0,
            levelTarget = 0,
            xpCurrent = 0,
            xpTarget = 0,
            difference = 0,
            amount = 0;
        this.info.levelTarget = parseInt($('#calculator-target-level').val());
        console.log(this.info.levelTarget);
        this.info.XPTarget = this.calculateXP(this.info.levelTarget);
        if(this.info.XPCurrent > this.info.XPTarget)
            this.info.XPTarget = this.calculateXP(parseInt(this.info.levelCurrent, 10) + 1);
        levelCurrent = this.info.levelCurrent;
        levelTarget = this.info.levelTarget;
        xpCurrent = this.info.XPCurrent;
        xpTarget = this.info.XPTarget;
        difference = xpTarget - xpCurrent;
        $.each(this.items, function (index, value) {
            amount = Math.ceil(difference / calculator.items[index].xp);
            amount = amount < 0 ? 0 : amount;
            $(calculator.elements.table + ' tr:nth-child(' + (index + 1) + ') td:nth-child(4)').html(amount);

            console.log(calculator.items[index].name);
            console.log(calculator.items[index].level);
            console.log(levelCurrent);
            console.log(levelTarget);
            console.log(calculator.items[index].level);
            console.log("\n\n\n\n\n");


            if(calculator.items[index].level <= levelCurrent) {
                $(calculator.elements.table + ' tr:nth-child(' + (index + 1) + ')').attr('class', 'text-success');
            } else if(calculator.items[index].level > levelCurrent && levelTarget >= calculator.items[index].level) {
                $(calculator.elements.table + ' tr:nth-child(' + (index + 1) + ')').attr('class', 'text-warning');
            } else {
                $(calculator.elements.table + ' tr:nth-child(' + (index + 1) + ')').attr('class', 'text-danger');
            }
        });
    }
}