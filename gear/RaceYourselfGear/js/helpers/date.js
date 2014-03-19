/*global define*/
/*jslint plusplus: true */

/**
 * Date helpers module
 */

define({
    name: 'helpers/date',
    requires: [
        'helpers/string'
    ],
    def: function helpersDate(string) {
        'use strict';

        var dayNames = [
                'Sunday',
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday'
            ],
            monthNames = [
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December'
            ],
            dateFormatFlags = /d{1,4}|m{1,4}|([HhMs])\1?|TT|yyyy/g;

        /**
         * Returns day name for specified date.
         * @param {Date} date
         * @param {boolean} short Short name version.
         * @return {string}
         */
        function getDayName(date, short) {
            var dayName = dayNames[date.getDay()];
            if (short) {
                dayName = dayName.substr(0, 3);
            }
            return dayName;
        }

        /**
         * Return month name for specified date
         * @param {Date} date
         * @param {boolean} short
         * @return {string}
         */
        function getMonthName(date, short) {
            var monthName = monthNames[date.getMonth()];
            if (short) {
                monthName = monthName.substr(0, 3);
            }
            return monthName;
        }

        /**
         * Format date using specified format string.
         * Following flags can be used:
         *  dddd - full day name
         *  ddd - short day name
         *  dd - day number with leading zeros
         *  d - day number
         *  mmmm - full month name
         *  mmm - short month name
         *  mm - month number with leading zeros
         *  yyyy - full 4-digit year
         *  m - month number
         *  H - hour (24h)
         *  HH - hour with leading zeros (24h)
         *  h - hour (12h)
         *  hh - hour with leading zeros (12h)
         *  M - minutes
         *  MM - minutes with leading zeros
         *  S - seconds
         *  SS - seconds with leading zeros
         *  TT - uppercase time format string (AM/PM)
         * @param {Date} date
         * @param {string} formatString
         * @return {string}
         */
        function format(date, formatString) {
            var day = date.getDate(),
                month = date.getMonth(),
                year = date.getFullYear(),
                hour = date.getHours(),
                minutes = date.getMinutes(),
                seconds = date.getSeconds(),
                mask = formatString,
                replacements = {
                    'yyyy': year,
                    'dddd': getDayName(date, false),
                    'ddd': getDayName(date, true),
                    'dd': string.pad(day),
                    'd': day,
                    'mmmm': getMonthName(date, false),
                    'mmm': getMonthName(date, true),
                    'mm': string.pad(month + 1),
                    'm': month + 1,
                    'H': hour,
                    'HH': string.pad(hour),
                    'h': hour % 12 || 12,
                    'hh': string.pad(hour % 12 || 12),
                    'M': minutes,
                    'MM': string.pad(minutes),
                    'S': seconds,
                    'SS': string.pad(seconds),
                    'TT': hour < 12 ? 'AM' : 'PM'
                };

            return mask.replace(dateFormatFlags, function (flag) {
                return replacements.hasOwnProperty(flag) ?
                    replacements[flag] : flag;
            });
        }
        
        function getWeek(date) {
            date.setHours(0, 0, 0, 0);
            // Thursday in current week decides the year.
            date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
            // January 4 is always in week 1.
            var week1 = new Date(date.getFullYear(), 0, 4);
            // Adjust to Thursday in week 1 and count number of weeks from date to week1.
            return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
                                  - 3 + (week1.getDay() + 6) % 7) / 7);
        }

        // Returns the four-digit year corresponding to the ISO week of the date.
        function getWeekYear(date) {
            date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
            return date.getFullYear();
        }

        return {
            getDayName: getDayName,
            getMonthName: getMonthName,
            format: format,
            getWeek: getWeek,
            getWeekYear: getWeekYear
        };
    }
});
