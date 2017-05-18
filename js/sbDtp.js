(function(angular) {
    'use strict';

    /* based on https://github.com/AmirkabirDataMiners/ADM-dateTimePicker */

    if (!angular.merge)
        angular.merge = angular.extend;

    String.prototype.lZero = function() {
        return (this.length < 2 ? '0' + this : this);
    };
    Array.prototype.toNumber = function() {
        return this.map(function(item) { return Number(item); });
    };
    Array.prototype.dtp_toDate = function(type) {
        var splitter = '-';
        if (/invalid/i.test(new Date('1991-9-12')))
            splitter = '/';

        var date = this.join(splitter);
        if (this.length == 5)
            date = this.slice(0, 3).join(splitter) + ' ' + this.slice(3, 5).join(':')
        if (!type) return date;
        date = new Date(date);
        if (type == 'unix')
            return date.getTime();
        return date;
    };
    Number.prototype.lZero = function() {
        return (this < 10 ? '0' + this : this);
    };
    Date.prototype.dtp_shortDate = function() {
        return [this.getFullYear(), this.getMonth() + 1, this.getDate()].dtp_toDate();
    }

    var SBdtpProvider = function() {
        var options = {
            calType: 'gregorian',
            format: 'DD/MM/YYYY hh:mm',
            multiple: true,
            autoClose: false,
            transition: false,
            disabled: [],
            smartDisabling: true,
            minuteStep: 1,
            gregorianStartDay: 1,
            gregorianDic: {
                title: 'Gregorian',
                monthsNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
                daysNames: ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'],
                todayBtn: 'Hoy',
            }

        };

        var SBdtp = {
            getOptions: function(type) {
                var typeOptions = type && options[type] || options;
                return typeOptions;
            }
        };

        this.setOptions = function(type, customOptions) {
            if (!customOptions) {
                customOptions = type;
                options = angular.merge(options, customOptions);
                return;
            }
            options[type] = angular.merge(options[type] || {}, customOptions);
        };

        this.$get = function() {
            return SBdtp;
        };

    };

    var SBdtpDigitTypeFilter = function() {
        return function(input, type) {
            return input;
        };
    };

    var SBdtpConvertor = function() {
        function getDaysPassedInGregorianCalender(date) {
            var gregorianMonths = getGregorianMonths();
            var passedLeapYears = howManyGregorianLeapsYearPassed(date.year);
            var days = passedLeapYears;
            var isMiladiLeaps = isGregorianLeapYear(date.year);
            days += (date.year - 1) * 365;
            for (var i = 0; i < date.month - 1; i++) {
                if (isMiladiLeaps && i + 1 == 2) {
                    gregorianMonths[i].count = 29;
                }
                days += gregorianMonths[i].count;

            }
            days += date.day;
            return days;
        }

        function getGregorianMonths() {
            return [
                { id: 1, count: 31 },
                { id: 2, count: 28 },
                { id: 3, count: 31 },
                { id: 4, count: 30 },
                { id: 5, count: 31 },
                { id: 6, count: 30 },
                { id: 7, count: 31 },
                { id: 8, count: 31 },
                { id: 9, count: 30 },
                { id: 10, count: 31 },
                { id: 11, count: 30 },
                { id: 12, count: 31 }
            ];
        }

        function isGregorianLeapYear(year) {
            if (year % 4 != 0) {
                return false;
            }
            if (year % 100 != 0) {
                return true;
            }
            if (year % 400 != 0) {
                return false;
            }
            return true;
        }

        function howManyGregorianLeapsYearPassed(year) {
            var yearsPassed = year - 1;
            var countOfFourYears = Math.floor(yearsPassed / 4);
            var countOfHandredYears = Math.floor(yearsPassed / 100);
            var countOfFourHandredYears = Math.floor(yearsPassed / 400);
            return countOfFourYears - countOfHandredYears + countOfFourHandredYears;
        }

        function getGregorianYear(gregorianPassedDays) {
            var pureYear = Math.floor((gregorianPassedDays) / 365);
            var gregorianLeapsYear = howManyGregorianLeapsYearPassed(pureYear);
            var year = Math.floor((gregorianPassedDays - gregorianLeapsYear) / 365);
            var remainDay = gregorianPassedDays - year * 365 - gregorianLeapsYear;
            if (remainDay != 0) {
                year++;
            } else if (isGregorianLeapYear(year + 1)) {
                year += gregorianLeapsYear / 365;
            }
            return Math.floor(year);
        }

        function getGregorianMonth(daysPassed) {
            var year = getGregorianYear(daysPassed);
            var leaspYearCount = howManyGregorianLeapsYearPassed(year);
            daysPassed -= (year - 1) * 365 + leaspYearCount;
            var months = getGregorianMonths();
            var month = 0;
            var isCurrentYearLeaps = isGregorianLeapYear(year);
            for (var i = 0; i < months.length; i++) {
                if (isCurrentYearLeaps && months[i].id == 2) {
                    months[i].count = 29;
                }
                if (daysPassed < months[i].count) {
                    if (daysPassed != 0 || month == 0) {
                        month++;
                    }
                    return month;
                }
                daysPassed -= months[i].count;
                month = months[i].id;
            }
            return month;
        }

        function getGregorianDayOfMonthByPassedDay(daysPassed) {
            var year = getGregorianYear(daysPassed);
            var month = getGregorianMonth(daysPassed);
            return getGregorianDayOfMonth(year, month, daysPassed);
        }

        function getGregorianDayOfMonth(year, month, daysPassed) {
            var leaspYearCount = howManyGregorianLeapsYearPassed(year);
            var months = getGregorianMonths();
            var sumOfMonths = 0;
            for (var i = 0; i < months.length; i++) {
                if (months[i].id < month) {
                    sumOfMonths += months[i].count;
                }
            }
            if (isGregorianLeapYear(year) && month > 2) {
                sumOfMonths++;
            }
            return daysPassed - (year - 1) * 365 - leaspYearCount - sumOfMonths;
        }
  
        function getGregorianDate(date) {
            var day = getGregorianDayOfMonthByPassedDay(date);
            var month = getGregorianMonth(date);
            var year = getGregorianYear(date);
            if (day == 0) {
                day = 31;
                month = 12;
                year--;
            }
            return {
                day: day,
                month: month,
                year: year
            };

        }
     
        var getGregorianDates = function(year, mont, day) {
            year = (year <= 99) ? (1300 + year) : year;
            var date = getGregorianDate({
                day: day,
                month: mont,
                year: year
            });
            return date;
        }

        return {
            toGregorian: getGregorianDates,
        }
    }

    var SBdtpFactory = function(SBdtpConvertor) {

        this.dateFormat = function(date, time, format, notView) {
            if (!date.year) return '';

            var year = date.year;
            var halfYear = notView ? date.year : date.year % 100;
            var month = date.month.lZero();
            var day = date.day.lZero();
            var hour = time.hour.lZero();
            var minute = time.minute.lZero();

            var replaceMap = [
                { key: 'YYYY', value: year },
                { key: 'YY', value: halfYear },
                { key: 'MM', value: month },
                { key: 'DD', value: day },
                { key: 'hh', value: hour },
                { key: 'mm', value: minute }
            ]

            for (var i = 0, j = replaceMap.length; i < j; i++) {
                format = format.replace(replaceMap[i].key, replaceMap[i].value);
            }

            return format;
        };
        this.parseString = function(str, format) {
            var _keys = [],
                _date = {};
            var formats = ['YY/MM/DD', 'YY/MM/DD hh:mm', 'YY-MM-DD', 'YY-MM-DD hh:mm', 'MM/DD/YY', 'MM-DD-YY', 'MM/DD/YY hh:mm', 'MM-DD-YY hh:mm'];
            formats.unshift(format);

            for (var i = 0, j = formats.length; i < j; i++) {
                var _isValid = new RegExp('^' + formats[i].replace(/[a-z]+/gi, function(key) {
                    var _mustReplace = false;
                    if (key.indexOf('YY') != -1)
                        _keys.push('year'), _mustReplace = true;
                    else if (key.indexOf('MM') != -1)
                        _keys.push('month'), _mustReplace = true;
                    else if (key.indexOf('DD') != -1)
                        _keys.push('day'), _mustReplace = true;
                    else if (key.indexOf('hh') != -1)
                        _keys.push('hour'), _mustReplace = true;
                    else if (key.indexOf('mm') != -1)
                        _keys.push('minute'), _mustReplace = true;

                    if (_mustReplace)
                        return '[0-9]+';
                    else
                        return key;
                }).replace(/[(]/g, '[(]').replace(/[)]/g, '[)]') + '$').test(str);

                if (!_isValid)
                    continue;

                _keys.reverse();

                str.replace(/[0-9]+/g, function(value) {
                    _date[_keys.pop()] = Number(value);
                    return value;
                });
                _date.hour = _date.hour || 0;
                _date.minute = _date.minute || 0;

                return _date;
            }

            return false;
        };
        this.toRegularFormat = function(date, type, format) {
            if (!date) return false;

            if (typeof date == "string")
                date = this.parseString(date, format);
            else if (typeof date == "number")
                date = this.convertFromUnix(date, type);

            if (!date) return false;

            if (date.year <= 99)
                date.year = 2000 + date.year;

            return [date.year, date.month.lZero(), date.day.lZero(), date.hour.lZero(), date.minute.lZero()].dtp_toDate();
        };
        this.isDateEqual = function(date1, date2) {
            var diff = new Date(date1) - new Date(date2);
            return diff == 0;
        };
        this.isDateBigger = function(date1, date2) {
            var diff = new Date(date1) - new Date(date2);
            return diff >= 0;
        };
        this.isMonthBigger = function(date1, date2) {
            var diff = new Date(date1.year, date1.month) - new Date(date2.year, date2.month);
            return diff >= 0;
        };
        this.joinTime = function(date, time) {
            return new Date(new Date(new Date(date).setHours(time.hour)).setMinutes(time.minute));
        };
        this.removeTime = function (date) {
            return [date.getFullYear(), date.getMonth() + 1, date.getDate()].dtp_toDate('date');
        }
        this.convertToUnix = function(value, type, format) {
            if (!value)
                return null;
            if (typeof value == "number")
                return value;

            if (typeof value == "string") {
                value = this.parseString(value, format);
            } else if (value instanceof Date)
                value = { year: value.getFullYear(), month: value.getMonth() + 1, day: value.getDate(), hour: value.getHours(), minute: value.getMinutes() };
            else
                return null;

            if (value.year <= 99)
                value.year = 2000 + value.year;

            if (type == 'gregorian') {
                var _dateTime = new Date(this.toRegularFormat(value, type));
                return (/invalid/i.test(_dateTime)) ? null : _dateTime.getTime();
            }

            return null;
        };
        this.convertFromUnix = function(unix, type) {
            var _gDate = new Date(unix);
            if (type == 'gregorian')
                return {
                    year: _gDate.getFullYear(),
                    month: _gDate.getMonth() + 1,
                    day: _gDate.getDate(),
                    unix: unix
                };
        };
        this.parseDisablePattern = function(options) {
            var arr = options.disabled,
                smart = options.smartDisabling,
                calType = options.calType,
                format = options.format;

            var _inWeek = Array.apply(null, Array(7)).map(Number.prototype.valueOf, 0);
            var _inMonth = Array.apply(null, Array(31)).map(Number.prototype.valueOf, 0);
            var _static = {};

            if (arr instanceof Array) {
                for (var i = 0, j = arr.length; i < j; i++) {
                    if (typeof arr[i] == "number") {
                        var _gDate = new Date(arr[i]);
                        if (!/invalid/i.test(_gDate))
                            _static[this.removeTime(_gDate).getTime()] = true;
                    } else if (typeof arr[i] == "string") {
                        arr[i] = arr[i].toLowerCase();
                        if (arr[i].indexOf('d') == -1 && arr[i].indexOf('i') == -1) {
                            var _unix = this.convertToUnix(arr[i], calType, format);
                            if (_unix)
                                _static[_unix] = true;
                        } else {
                            var _inMonthValid = new RegExp("^[!]?(([0-9]?[0-9])?[d]([+][0-9][0-9]?)?)([&]([0-9]?[0-9])?[d]([+][0-9][0-9]?)?)*?$").test(arr[i]);
                            var _inWeekhValid = new RegExp("^[!]?([i]([+][0-9][0-9]?)?)([&][i]([+][0-9][0-9]?)?)*?$").test(arr[i]);

                            if (_inMonthValid || _inWeekhValid) {
                                var _not = arr[i][0] == '!';
                                arr[i] = _not ? arr[i].split('!')[1] : arr[i];
                                var _patt = arr[i].split('&');

                                if (_inMonthValid) {
                                    var _tmpObj = {};
                                    _patt.forEach(function(item) {
                                        var _params = item.split(/d[+]?/).map(function(str) { return Number(str); });
                                        _params[0] = _params[0] ? _params[0] : 1;
                                        _params[1] %= 31;

                                        for (var k = 0; k < 31; k++) {
                                            if (_params[0] != 1 && k % _params[0] == _params[1] || _params[0] == 1 && k == _params[1])
                                                _tmpObj[k] = 1;
                                        }
                                    });
                                    for (var k = 0; k < 31; k++) {
                                        if (_not) {
                                            if (!_tmpObj[k])
                                                _inMonth[k] = 1;
                                        } else {
                                            if (_tmpObj[k])
                                                _inMonth[k] = 1;
                                        }
                                    }
                                } else if (_inWeekhValid) {
                                    var _tmpObj = {};
                                    _patt.forEach(function(item) {
                                        var _params = item.split(/i[+]?/).map(function(str) { return Number(str); });
                                        _params[1] %= 7;
                                        _tmpObj[_params[1]] = 1;
                                    });
                                    for (var k = 0; k < 7; k++) {
                                        if (_not) {
                                            if (!_tmpObj[k])
                                                _inWeek[k] = 1;
                                        } else {
                                            if (_tmpObj[k])
                                                _inWeek[k] = 1;
                                        }

                                    }
                                }
                            } else {
                                console.warn(arr[i] + " is not valid!");
                            }
                        }
                    }
                }
            }
            return { smart: smart, calType: calType, static: _static, inWeek: _inWeek, inMonth: _inMonth };
        }
        this.isDayDisable = function(calType, disabled, day) {
            if (disabled.static[day.unix])
                return true;

            var _gap = (disabled.smart) ? +1 : -1;

            var _dayName = (day.dayName + 7 + _gap) % 7;

            if (disabled.inMonth[day.day - 1])
                return true;

            return !!+disabled.inWeek[_dayName];
        }

        return {
            dateFormat: this.dateFormat,
            parseString: this.parseString,
            toRegularFormat: this.toRegularFormat,
            isDateEqual: this.isDateEqual,
            isDateBigger: this.isDateBigger,
            isMonthBigger: this.isMonthBigger,
            joinTime: this.joinTime,
            removeTime: this.removeTime,
            convertToUnix: this.convertToUnix,
            convertFromUnix: this.convertFromUnix,
            parseDisablePattern: this.parseDisablePattern,
            isDayDisable: this.isDayDisable,
            counter: 0
        }
    }

    var SBdtpCalendarDirective = function(SBdtp, SBdtpConvertor, SBdtpFactory, constants, $timeout) {

        return {
            restrict: 'E',
            replace: true,

            link: function(scope, element, attrs) {

                var sbDtp = scope.api;

                var _standValue;
                if (!scope.dtpValue.unix)
                    _standValue = new Date();
                else
                    _standValue = new Date(scope.dtpValue.fullDate);

                sbDtp.fillDays(_standValue, !scope.option.transition);

                scope.previousMonth = function(flag) {
                    if (scope.current.month == 1)
                        scope.current.month = 12, scope.current.year--;
                    else
                        scope.current.month--
                        sbDtp.reload();
                }

                scope.nextMonth = function(flag) {
                    if (scope.current.month == 12)
                        scope.current.month = 1, scope.current.year++;
                    else
                        scope.current.month++
                        sbDtp.reload();
                }

                scope.previousYear = function(flag) {
                    var _firstYear = scope.generatedYears.shift();
                    scope.generatedYears = [];
                    for (var i = 1; i < 17; i++) {
                        scope.generatedYears.push(_firstYear - 17 + i);
                    }
                }

                scope.nextYear = function(flag) {
                    var _lastYear = scope.generatedYears.pop();
                    scope.generatedYears = [];
                    for (var i = 1; i < 17; i++) {
                        scope.generatedYears.push(_lastYear + i);
                    }
                }

                scope.selectMonthInit = function() {
                    scope.yearSelectStat = false;
                    scope.monthPickerStat = true;
                }

                scope.selectYearInit = function() {
                    scope.yearSelectStat = true;
                    scope.generatedYears = [];
                    for (var i = 0; i < 16; i++) {
                        scope.generatedYears.push(scope.current.year + i - 7);
                    }
                }

                scope.selectMonth = function(monthIdx) {
                    if (monthIdx + 1 != scope.current.month) {
                        scope.current.month = monthIdx + 1;
                        sbDtp.reload();
                    }
                    scope.monthPickerStat = false;
                }

                scope.selectYear = function(yearName) {
                    if (yearName != scope.current.year) {
                        scope.current.year = yearName;
                        sbDtp.reload();
                    }
                    scope.monthPickerStat = false;
                }

                scope.selectThisDay = function(day) {
                    if (day.valid == 0)
                        return;

                    scope.dtpValue.selected = false;

                    sbDtp.updateMasterValue(day, 'day');

                    if (scope.option.autoClose) {
                        $timeout(function() {
                            scope.closeCalendar();
                        }, 100);
                        return;
                    }


                    if (day.disable) {
                        $timeout(function() {
                            if (SBdtpFactory.isMonthBigger(day, scope.current))
                                scope.nextMonth(true);
                            else
                                scope.previousMonth(true);
                        }, 0);
                    } else
                        day.selected = true;
                }

                scope.today = function() {
                    var _standValue = new Date();
                    sbDtp.fillDays(_standValue, !scope.option.transition);
                }

                scope.changeTimeValue = function(variable, value) {
                    value *= (variable == 'minute' ? scope.option.minuteStep : 1);

                    var _num = (Number(scope.time[variable]) + value + ((variable == 'hour') ? 24 : 60)) % ((variable == 'hour') ? 24 : 60);
                    var _timeCopy = angular.copy(scope.time);
                    _timeCopy[variable] = _num.lZero();

                    if (scope.dtpValue.unix) {
                        if (scope.minDate || scope.maxDate) {
                            var _dateTime = SBdtpFactory.joinTime(scope.dtpValue.unix, _timeCopy);
                            if ((scope.minDate && !SBdtpFactory.isDateBigger(_dateTime, scope.minDate)) || (scope.maxDate && !SBdtpFactory.isDateBigger(scope.maxDate, _dateTime)))
                                return;
                        }
                    }

                    scope.time[variable] = _num.lZero();


                    if (scope.dtpValue.unix)
                        sbDtp.updateMasterValue(false, 'time');

                    sbDtp.reload();
                }

                scope.modelChanged = function(input) {

                    var _value = (angular.isDefined(input) ? input : scope.dtpValue.formated);

                    if (!_value) {
                        if (scope.dtpValue.unix)
                            scope.destroy();
                        return;
                    }

                    var _inputUnix = SBdtpFactory.convertToUnix(_value, scope.calType, scope.option.format);
                    if (!_inputUnix || scope.option.freezeInput || scope.disable || ((scope.minDate && !SBdtpFactory.isDateBigger(_inputUnix, scope.minDate)) || (scope.maxDate && !SBdtpFactory.isDateBigger(scope.maxDate, _inputUnix)))) {
                        sbDtp.updateMasterValue(false);
                        return;
                    }

                    if (_inputUnix == scope.fullData.unix)
                        return;

                    scope.parseInputValue(_value, false, true);

                    var _gDate = new Date(_inputUnix);

                    sbDtp.fillDays(_gDate, true);

                }
                sbDtp.modelChanged = scope.modelChanged;

                scope.calTypeChanged = function(calType) {
                    scope.calType = calType;

                    scope.monthNames = scope.option[scope.calType + 'Dic'].monthsNames;
                    scope.daysNames = scope.option[scope.calType + 'Dic'].daysNames;

                    var _cur = angular.copy(scope.current);
                    var _mainDate;

                    _mainDate = SBdtpConvertor.toGregorian(_cur.year, _cur.month, 15);
                    _mainDate = [_mainDate.year, _mainDate.month, _mainDate.day].dtp_toDate('date');

                    if (scope.dtpValue.unix) {
                        sbDtp.updateMasterValue(SBdtpFactory.convertFromUnix(scope.dtpValue.unix, scope.calType));
                    }

                    sbDtp.fillDays(_mainDate, true);
                }
            },
            templateUrl: 'js/templates/sbDtp_calendar.html'
        }
    }

    var SBdtpDirective = function(SBdtp, SBdtpConvertor, SBdtpFactory, constants, $compile, $timeout) {

        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            require: ['ngModel', 'sbDtp'],
            scope: {
                options: '=?',
                fullData: '=?',
                name: '=?',
                ngRequired: '=?',
                onChange: '&?',
                onDatechange: '&?',
                onTimechange: '&?',
                onOpen: '&?',
                onClose: '&?',
            },
            link: function(scope, element, attrs, ctrls) {
                var ngModel = ctrls[0],
                    sbDtp = ctrls[1];
                scope.api = sbDtp;
                scope.dtpId = 'sb-' + (++SBdtpFactory.counter);

                if (!element.find('ng-transclude').children().length) {
                    scope.defaultTemplate = true;
                    element.find('ng-transclude').remove();
                }

                var _options = scope.options;
                if (!(_options instanceof Object))
                    _options = {};
                scope.option = angular.merge(angular.copy(SBdtp.getOptions()), _options);
                scope.option.minuteStep = Math.max(Math.min(scope.option.minuteStep, 60), 1);
                var dayNames = angular.copy(scope.option.gregorianDic.daysNames);
                scope.option.gregorianDic.daysNamesUntouched = dayNames;
                scope.option.gregorianDic.daysNames = dayNames.slice(scope.option.gregorianStartDay, 7).concat(dayNames.slice(0, scope.option.gregorianStartDay));

                scope.disableDays = SBdtpFactory.parseDisablePattern(scope.option);
                scope.calType = scope.option.calType;
                scope.monthNames = scope.option[scope.calType + 'Dic'].monthsNames;
                scope.daysNames = scope.option[scope.calType + 'Dic'].daysNames;
                scope.timeoutValue = [0, 0];
                scope.dtpValue = {};

                scope.minDate = scope.mindate ? new Date(scope.mindate) : null;
                scope.maxDate = scope.maxdate ? new Date(scope.maxdate) : null;

                scope.current = {
                    year: '',
                    month: '',
                    monthDscr: '',
                    days: []
                };


                scope.updateMasterValue = function(newDate, releaseTheBeast) {
                    if (!newDate)
                        newDate = (scope.dtpValue.unix ? scope.dtpValue : {});

                    scope.$applyAsync(function() {
                        scope.dtpValue = newDate;
                        var minute = Number(scope.time.minute);
                        minute -= minute % scope.option.minuteStep;
                        scope.time.minute = minute.lZero();
                        scope.dtpValue.formated = SBdtpFactory.dateFormat(newDate, scope.time, scope.option.format);
                        scope.dtpValue.fullDate = SBdtpFactory.joinTime(newDate.unix, scope.time);
                        scope.fullData = {
                            formated: scope.dtpValue.formated,
                            lDate: scope.dtpValue.fullDate.dtp_shortDate(),
                            gDate: scope.dtpValue.fullDate,
                            unix: scope.dtpValue.fullDate.getTime(),
                            year: newDate.year,
                            month: newDate.month,
                            day: newDate.day,
                            hour: Number(scope.time.hour),
                            minute: Number(scope.time.minute),
                            minDate: scope.minDate,
                            maxDate: scope.maxDate,
                            calType: scope.calType,
                            format: scope.option.format
                        }

                        ngModel.$setViewValue(scope.dtpValue.formated);
                        ngModel.$render();

                        if (scope.hasInputDtp)
                            element[0].querySelector('[dtp-input]').value = scope.dtpValue.formated;

                        if (releaseTheBeast) {
                            if (scope.onChange)
                                scope.onChange({ date: scope.fullData });
                            if (releaseTheBeast == 'time' && scope.onTimechange)
                                scope.onTimechange({ date: scope.fullData });
                            else if (releaseTheBeast == 'day' && scope.onDatechange)
                                scope.onDatechange({ date: scope.fullData });
                        }

                    });
                }

                scope.parseInputValue = function(valueStr, resetTime, releaseTheBeast) {
                    if (valueStr == 'today') {
                        valueStr = SBdtpFactory.removeTime(new Date()).getTime();
                    }

                    var _dateTime = false;

                    if (valueStr) {
                        if (typeof valueStr == "string")
                            valueStr = SBdtpFactory.toRegularFormat(valueStr, scope.calType, scope.option.format);

                        _dateTime = new Date(valueStr);
                        _dateTime = (/invalid/i.test(_dateTime)) ? false : _dateTime;
                    }

                    if (_dateTime) {
                        scope.dtpValue = {
                            year: _dateTime.year || _dateTime.getFullYear(),
                            month: _dateTime.month || _dateTime.getMonth() + 1,
                            day: _dateTime.day || _dateTime.getDate(),
                            unix: _dateTime.unix || _dateTime.getTime(),
                            fullDate: _dateTime.gDate || _dateTime
                        }

                        scope.dtpValue.fullDate = SBdtpFactory.removeTime(scope.dtpValue.fullDate);
                        scope.dtpValue.unix = scope.dtpValue.fullDate.getTime();

                        scope.time = {
                            hour: (_dateTime.getHours ? _dateTime.getHours() : _dateTime.hour).lZero(),
                            minute: (_dateTime.getMinutes ? _dateTime.getMinutes() : _dateTime.minute).lZero()
                        }

                        scope.updateMasterValue(false, releaseTheBeast);
                    } else {
                        if (resetTime)
                            scope.time = {
                                hour: '00',
                                minute: '00'
                            }
                    }
                }
                scope.parseInputValue(ngModel.$viewValue || scope.option.default, true, false);

                ngModel.$formatters.push(function(val) {
                    if (!val && scope.dtpValue.unix) {
                        scope.destroy();
                    } else if (scope.dtpValue && val == scope.dtpValue.formated) {} else {
                        scope.parseInputValue(val, false, true);
                    }

                    return val;
                });

                if (scope.option.watchingOptions) {
                    scope.$watch('options', function(nuVal, old) {
                        if (!nuVal || typeof nuVal != 'object') return;
                        if (old && JSON.stringify(old) == JSON.stringify(nuVal)) return;

                        var daysNamesUntouched = scope.option.gregorianDic.daysNamesUntouched;
                        scope.option = angular.merge(angular.copy(SBdtp.getOptions()), nuVal);
                        scope.option.minuteStep = Math.max(Math.min(scope.option.minuteStep, 60), 1);

                        if (nuVal.gregorianDic && nuVal.gregorianDic.daysNames)
                            scope.option.gregorianDic.daysNamesUntouched = nuVal.gregorianDic.daysNames;
                        else
                            scope.option.gregorianDic.daysNamesUntouched = daysNamesUntouched;

                        var dayNames = angular.copy(scope.option.gregorianDic.daysNamesUntouched);
                        scope.option.gregorianDic.daysNames = dayNames.slice(scope.option.gregorianStartDay, 7).concat(dayNames.slice(0, scope.option.gregorianStartDay));

                        scope.disableDays = SBdtpFactory.parseDisablePattern(scope.option);
                        if (scope.calTypeChanged) scope.calTypeChanged(scope.option.calType);
                    }, true);
                }

                attrs.$observe("disable", function(_newVal) {
                    scope.$applyAsync(function() {
                        _newVal = scope.$eval(_newVal);
                        scope.disable = _newVal;
                    });
                });

                attrs.$observe("mindate", function(_newVal) {
                    scope.$applyAsync(function() {
                        _newVal = scope.$eval(_newVal);
                        scope.minDate = SBdtpFactory.convertToUnix(_newVal, scope.calType, scope.option.format);
                    });
                });

                attrs.$observe("maxdate", function(_newVal) {
                    scope.$applyAsync(function() {
                        _newVal = scope.$eval(_newVal);
                        scope.maxDate = SBdtpFactory.convertToUnix(_newVal, scope.calType, scope.option.format);
                    });
                });

                scope.onKeydown = function(e) {
                    if (e.keyCode == 9)
                        scope.closeCalendar();
                }

                scope.openCalendar = function() {
                    if (scope.showCalendarStat || scope.disable)
                        return;

                    scope.timeoutValue[0] = 0;
                    scope.showCalendarStat = true;

                    var _sbDtpCalendarHtml = angular.element('<sb-dtp-calendar id="' + scope.dtpId + '" style="opacity:0; z-index: ' + scope.option.zIndex + ';"></sb-dtp-calendar>');
                    angular.element(document.body).append(_sbDtpCalendarHtml);

                    scope.$applyAsync(function() {
                        $compile(_sbDtpCalendarHtml)(scope);
                    });

                    $timeout(function() {
                        var top = document.documentElement.scrollTop || document.body.scrollTop;
                        var popup = document.getElementById(scope.dtpId);
                        var popupBound = popup.getBoundingClientRect();
                        var _input = element.children().children()[0];
                        var _inputBound = _input.getBoundingClientRect();
                        var _corner = {
                            x: _inputBound.left,
                            y: _inputBound.top + _inputBound.height
                        }

                        var _totalSize = {
                            width: popupBound.width + _corner.x,
                            height: popupBound.height + _corner.y
                        }

                        var _pos = {
                            top: '',
                            bottom: '',
                            left: '',
                            right: ''
                        }
                        if (_totalSize.height > window.innerHeight)
                            _pos.top = (top + _inputBound.top - popupBound.height) + 'px';
                        else
                            _pos.top = (top + _inputBound.top + _inputBound.height) + 'px';

                        if (_totalSize.width > window.innerWidth)
                            _pos.left = (_corner.x + window.innerWidth - _totalSize.width - 20) + 'px';
                        else
                            _pos.left = _corner.x + 'px';

                        angular.element(popup).css({ top: _pos.top, bottom: _pos.bottom, left: _pos.left, opacity: 1 });

                    }, 70);

                    if (scope.onOpen)
                        scope.onOpen();
                }

                scope.closeCalendar = function() {
                    if (!scope.showCalendarStat)
                        return;

                    scope.$applyAsync(function() {
                        scope.monthPickerStat = false;
                        scope.timePickerStat = false;
                        scope.showCalendarStat = false;
                    });

                    var popup = document.getElementById(scope.dtpId);
                    if (popup) {
                        angular.element(popup).remove();

                        if (scope.onClose)
                            scope.onClose();
                    }

                }

                scope.toggleCalendar = function() {
                    if (scope.showCalendarStat)
                        scope.closeCalendar();
                    else
                        scope.openCalendar();
                }

                scope.destroy = function(noRefresh) {
                    if (scope.disable)
                        return;

                    scope.monthPickerStat = false;
                    scope.timePickerStat = false;

                    scope.current = {
                        year: '',
                        month: '',
                        monthDscr: '',
                        days: []
                    };
                    scope.dtpValue = {};
                    scope.fullData = {
                        minDate: scope.minDate,
                        maxDate: scope.maxDate
                    }
                    scope.time = {
                        hour: '00',
                        minute: '00'
                    }
                    var _standValue = new Date();

                    ngModel.$setViewValue('');
                    ngModel.$render();

                    if (!noRefresh)
                        sbDtp.fillDays(_standValue, !scope.option.transition);

                    if (scope.onChange)
                        scope.onChange({ date: scope.fullData });
                }

                var dtpOpen = element[0].querySelector('[dtp-open]') || {};
                dtpOpen.onclick = scope.openCalendar;

                var dtpClose = element[0].querySelector('[dtp-close]') || {};
                dtpClose.onclick = scope.closeCalendar;

                var dtpToggle = element[0].querySelector('[dtp-toggle]') || {};
                dtpToggle.onclick = scope.toggleCalendar;

                var dtpDestroy = element[0].querySelector('[dtp-destroy]') || {};
                dtpDestroy.onclick = scope.destroy;
            },
            controller: ['$scope', function($scope) {

                this.updateMasterValue = function(newDate, releaseTheBeast) {
                    $scope.updateMasterValue(newDate, releaseTheBeast);
                }

                this.fillDays = function(date, noTransition) {

                    if (noTransition)
                        $scope.timeoutValue[0] = 0;
                    else
                        $scope.loadingDays = true;

                    var _mainDate = angular.copy(date);

                    var _input = {
                        year: date.getFullYear(),
                        month: date.getMonth() + 1,
                        day: date.getDate()
                    }

                    $scope.$applyAsync(function() {
                        var _month = _mainDate.month || (_mainDate.getMonth() + 1);
                        angular.merge($scope.current, {
                            year: _mainDate.year || _mainDate.getFullYear(),
                            month: _month,
                            monthDscr: $scope.monthNames[_month - 1]
                        });
                    });

                    var startDay, shift = startDay = $scope.option.gregorianStartDay;

                    var _today = new Date();
                    _today = [_today.getFullYear(), _today.getMonth() + 1, _today.getDate(), 1, 0].dtp_toDate('unix');

                    var _selected = ($scope.dtpValue.unix || -1),
                        _selectedIdx;

                    var _currDay = [_input.year, _input.month, _input.day, 1, 0].dtp_toDate('date');
                    var _firstDayName = new Date(angular.copy(_currDay).setDate(1)).getDay();

                    var _days = [];

                    var _diff = -1 * (_firstDayName - shift + 7) % 7,
                        _ite_date, _disable = true;
                    var _lastValidStat = -1;

                    while (true) {
                        _diff++;
                        var _ite_date = new Date(angular.copy(_currDay).setDate(_diff));
                        var _pDate = false;

                        var _thisDay = _pDate.day || _ite_date.getDate();

                        if (_thisDay == 1)
                            _disable = !_disable;

                        if (_disable && _thisDay < 8 && _ite_date.getDay() == startDay)
                            break;


                        var _isMin = false;
                        var _valid = 1;
                        if ($scope.minDate || $scope.maxDate) {
                            var _dateTime = SBdtpFactory.joinTime(_ite_date, $scope.time);
                            if (($scope.minDate && !SBdtpFactory.isDateBigger(_dateTime, $scope.minDate)) || ($scope.maxDate && !SBdtpFactory.isDateBigger($scope.maxDate, _dateTime))) {
                                _valid = 0;

                                if (_lastValidStat == 2)
                                    _days[_days.length - 1].isMax = true;
                            } else {
                                _valid = 2;

                                if (_lastValidStat == 0)
                                    _isMin = true;
                            }
                            _lastValidStat = _valid;
                        }

                        var _unix = _ite_date.getTime();
                        var _dayName = _ite_date.getDay();

                        var _day = {
                            day: _thisDay,
                            month: _pDate.month || _ite_date.getMonth() + 1,
                            year: _pDate.year || _ite_date.getFullYear(),
                            dayName: _dayName,
                            fullDate: _ite_date,
                            disable: _disable,
                            today: (_unix == _today),
                            selected: (_unix == _selected),
                            unix: _unix,
                            valid: _valid,
                            isMin: _isMin
                        }

                        if (SBdtpFactory.isDayDisable($scope.calType, $scope.disableDays, _day))
                            _day.valid = 0;

                        if (_day.selected)
                            _selectedIdx = _days.length;

                        _days.push(_day);
                    }

                    $timeout(function() {

                        $scope.timeoutValue[0] = 500;

                        $scope.$applyAsync(function() {
                            $scope.current.days = _days;
                            if (_selectedIdx)
                                $scope.updateMasterValue($scope.current.days[_selectedIdx]);
                            $timeout(function() {
                                $scope.loadingDays = false;
                            }, $scope.timeoutValue[1]);
                        });

                    }, $scope.timeoutValue[0]);
                }

                this.reload = function() {
                    var _cur = angular.copy($scope.current);
                    _cur.day = 29;
                    var _date = [_cur.year, _cur.month, 8].dtp_toDate('date');
                    this.fillDays(_date, !$scope.option.transition);
                }

                this.vm = $scope;
            }],
            templateUrl: 'js/templates/sbDtp_view.html'

        };
    }

    var dtpInputDirective = function() {
        return {
            require: ['^^sbDtp', 'ngModel'],
            link: function(scope, element, attrs, ctrls) {
                var sbDtp = ctrls[0],
                    ngModel = ctrls[1];

                ngModel.$parsers.push(function() {
                    return ngModel.$modelValue;
                })

                sbDtp.vm.hasInputDtp = true;

                element.on('focus', function() {
                    sbDtp.vm.openCalendar();
                });
                element.on('blur', function() {
                    sbDtp.vm.modelChanged(element[0].value);
                });

            }
        }
    }

    /* https://github.com/IamAdamJowett/angular-click-outside */
    var clickOutside = function($document) {
        return {
            restrict: 'A',
            scope: {
                clickOut: '&'
            },
            link: function($scope, elem, attr) {
                if (attr.id == undefined) attr.$set('id', 'id_' + Math.random());

                $document.on('click contextmenu', function(e) {
                    var i = 0,
                        element;

                    if (!e.target) return;

                    var classList = (attr.alias !== undefined) ? attr.alias.replace(', ', ',').split(',') : [];
                    classList.push(attr.id);

                    for (element = e.target; element; element = element.parentNode) {
                        var id = element.id;
                        var classNames = element.className;

                        if (id !== undefined) {
                            for (i = 0; i < classList.length; i++) {
                                if (id.indexOf(classList[i]) > -1 || (typeof classNames == 'string' && classNames.indexOf(classList[i]) > -1)) {
                                    return;
                                }
                            }
                        }
                    }

                    $scope.$eval($scope.clickOut);
                });
            }
        };
    }

    var SBdtpConfig = function(SBdtp) {
        SBdtp.setOptions({ isDeviceTouch: ('ontouchstart' in window || navigator.maxTouchPoints) });

        var style = document.createElement('style');
        style.type = 'text/css';

        var vendor = function(css) {
            return '-moz-' + css + '-o-' + css + '-webkit-' + css + css;
        }

        for (var i = 1; i < 51; i++)
            style.innerHTML += '.SBdtpDays>span:nth-child(' + i + ')>span {' + vendor('transition: all .5s, transform 0.2s ' + i * .01 + 's cubic-bezier(0.680, -0.550, 0.265, 1.550); ') + '}';

        document.getElementsByTagName('head')[0].appendChild(style);
    }

    return angular.module('SB-dateTimePicker', [])
        .constant('constants', {})
        .provider('SBdtp', SBdtpProvider)
        .filter('digitType', [SBdtpDigitTypeFilter])
        .factory('SBdtpConvertor', [SBdtpConvertor])
        .factory('SBdtpFactory', ['SBdtpConvertor', SBdtpFactory])
        .directive('sbDtp', ['SBdtp', 'SBdtpConvertor', 'SBdtpFactory', 'constants', '$compile', '$timeout', SBdtpDirective])
        .directive('sbDtpCalendar', ['SBdtp', 'SBdtpConvertor', 'SBdtpFactory', 'constants', '$timeout', SBdtpCalendarDirective])
        .directive('dtpInput', [dtpInputDirective])
        .directive('clickOut', ['$document', clickOutside])
        .config(['SBdtpProvider', SBdtpConfig]);
}(window.angular));