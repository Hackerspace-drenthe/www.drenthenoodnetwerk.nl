/**
 * Meetup Widget -- Fills next meetup date labels on pages that use data attributes.
 */
(function () {
  'use strict';

  var MEETUP_DAY = 3; // Wednesday
  var MEETUP_HOUR = 19;

  function getNextMeetup(now) {
    var eventDate = new Date(now);
    eventDate.setHours(MEETUP_HOUR, 0, 0, 0);

    var daysUntil = (MEETUP_DAY - now.getDay() + 7) % 7;
    if (daysUntil === 0 && now.getTime() >= eventDate.getTime()) {
      daysUntil = 7;
    }

    eventDate.setDate(now.getDate() + daysUntil);
    eventDate.setHours(MEETUP_HOUR, 0, 0, 0);

    return { eventDate: eventDate, daysUntil: daysUntil };
  }

  function formatDate(date) {
    var formatted = new Intl.DateTimeFormat('nl-NL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    }).format(date);

    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }

  function formatRelative(daysUntil) {
    if (daysUntil === 0) return 'vanavond om 19:00';
    if (daysUntil === 1) return 'morgen om 19:00';
    return 'over ' + daysUntil + ' dagen om 19:00';
  }

  function updateMeetupWidgets() {
    var result = getNextMeetup(new Date());
    var dateText = formatDate(result.eventDate);
    var relativeText = formatRelative(result.daysUntil);

    document.querySelectorAll('[data-meetup-next-date]').forEach(function (el) {
      el.textContent = dateText;
    });

    document.querySelectorAll('[data-meetup-next-relative]').forEach(function (el) {
      el.textContent = relativeText;
    });

    document.querySelectorAll('[data-meetup-next-iso]').forEach(function (el) {
      el.textContent = result.eventDate.toISOString();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateMeetupWidgets);
  } else {
    updateMeetupWidgets();
  }
})();
