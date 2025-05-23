'use client';

import { format, parseISO, isToday, isYesterday, isTomorrow, addDays, addWeeks, addMonths, addYears, getDay, startOfDay } from 'date-fns';
import { Check, ChevronDown, ChevronUp, Calendar, Repeat } from 'lucide-react';
import React, { useState, useRef, KeyboardEvent, TouchEvent, useEffect, DragEvent, useCallback } from 'react';

import { CustomCalendar } from '@/components/custom/custom-calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export type RecurringTask = {
  id: string;
  name: string;
  description: string;
  dueDate: string;
  completed: boolean;
  completedAt?: string;
  userId: string;
  recurrencePattern?: string;
};

// Natural language parsing utilities
const numberWords: { [key: string]: number } = {
  'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
  'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
  'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15
};

const ordinalWords: { [key: string]: number } = {
  'first': 1, 'second': 2, 'third': 3, 'fourth': 4, 'fifth': 5,
  'sixth': 6, 'seventh': 7, 'eighth': 8, 'ninth': 9, 'tenth': 10,
  'eleventh': 11, 'twelfth': 12
};

const dayNames: { [key: string]: number } = {
  'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
  'thursday': 4, 'friday': 5, 'saturday': 6
};

interface ParsedPattern {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'days_of_week' | 'invalid';
  interval?: number;
  daysOfWeek?: number[];
  suggestion?: string;
}

function parseRecurrencePattern(input: string): ParsedPattern {
  const normalized = input.toLowerCase().trim();
  
  // Replace number words with digits
  let processed = normalized;
  Object.entries(numberWords).forEach(([word, num]) => {
    processed = processed.replace(new RegExp(`\\b${word}\\b`, 'g'), num.toString());
  });
  
  // Replace ordinal words with digits  
  Object.entries(ordinalWords).forEach(([word, num]) => {
    processed = processed.replace(new RegExp(`\\b${word}\\b`, 'g'), num.toString());
  });
  
  // Special case: "daily"
  if (processed === 'daily') {
    return { type: 'daily', interval: 1, suggestion: 'daily' };
  }
  
  // Special case: "weekly"
  if (processed === 'weekly') {
    return { type: 'weekly', interval: 1, suggestion: 'weekly' };
  }
  
  // Special case: "bi-weekly"
  if (processed === 'bi-weekly' || processed === 'biweekly') {
    return { type: 'weekly', interval: 2, suggestion: 'bi-weekly' };
  }
  
  // Special case: "monthly"
  if (processed === 'monthly') {
    return { type: 'monthly', interval: 1, suggestion: 'every month' };
  }
  
  // Special case: "yearly"
  if (processed === 'yearly') {
    return { type: 'yearly', interval: 1, suggestion: 'every year' };
  }
  
  // Daily patterns
  if (processed.match(/^every\s+day$/)) {
    return { type: 'daily', interval: 1, suggestion: 'every day' };
  }
  
  if (processed.match(/^every\s+(\d+)\s+days?$/)) {
    const match = processed.match(/^every\s+(\d+)\s+days?$/);
    const interval = parseInt(match![1]);
    return { type: 'daily', interval, suggestion: `every ${interval} days` };
  }
  
  // Weekly patterns
  if (processed.match(/^every\s+week$/)) {
    return { type: 'weekly', interval: 1, suggestion: 'every week' };
  }
  
  if (processed.match(/^every\s+(\d+)\s+weeks?$/)) {
    const match = processed.match(/^every\s+(\d+)\s+weeks?$/);
    const interval = parseInt(match![1]);
    return { type: 'weekly', interval, suggestion: `every ${interval} weeks` };
  }
  
  // Monthly patterns
  if (processed.match(/^every\s+month$/)) {
    return { type: 'monthly', interval: 1, suggestion: 'every month' };
  }
  
  if (processed.match(/^every\s+(\d+)\s+months?$/)) {
    const match = processed.match(/^every\s+(\d+)\s+months?$/);
    const interval = parseInt(match![1]);
    return { type: 'monthly', interval, suggestion: `every ${interval} months` };
  }
  
  // Yearly patterns
  if (processed.match(/^every\s+year$/)) {
    return { type: 'yearly', interval: 1, suggestion: 'every year' };
  }
  
  if (processed.match(/^every\s+(\d+)\s+years?$/)) {
    const match = processed.match(/^every\s+(\d+)\s+years?$/);
    const interval = parseInt(match![1]);
    return { type: 'yearly', interval, suggestion: `every ${interval} years` };
  }
  
  // Special patterns for weekdays and weekends
  if (processed.match(/^(every\s+)?weekdays?$/)) {
    return {
      type: 'days_of_week',
      daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
      suggestion: 'every weekday'
    };
  }
  
  if (processed.match(/^(on\s+)?weekends?$/)) {
    return {
      type: 'days_of_week',
      daysOfWeek: [0, 6], // Sunday and Saturday
      suggestion: 'on weekends'
    };
  }
  
  // Single day patterns (with optional "every" prefix)
  const dayPattern = Object.keys(dayNames).join('|');
  
  // Pattern: "tuesdays", "sundays" (plural form)
  const pluralDayMatch = processed.match(new RegExp(`^(${dayPattern})s$`));
  if (pluralDayMatch) {
    const dayName = pluralDayMatch[1];
    return {
      type: 'days_of_week',
      daysOfWeek: [dayNames[dayName]],
      suggestion: `every ${dayName}`
    };
  }
  
  // Pattern: "tuesdays, wednesdays" (comma-separated plural days)
  const pluralDaysMatch = processed.match(new RegExp(`^((?:${dayPattern}s)(?:,\\s*(?:${dayPattern}s))*)$`));
  if (pluralDaysMatch) {
    const daysStr = pluralDaysMatch[1];
    const daysList = daysStr.split(',').map(d => d.trim());
    const days = daysList.map(d => d.replace(/s$/, '')).map(d => dayNames[d]).filter(d => d !== undefined);
    if (days.length > 0) {
      const sortedDays = days.sort();
      const formattedDays = sortedDays.map(d => Object.keys(dayNames).find(k => dayNames[k] === d));
      const suggestion = formattedDays.length > 2 
        ? formattedDays.slice(0, -1).join(', ') + ' and ' + formattedDays[formattedDays.length - 1]
        : formattedDays.join(' and ');
      return {
        type: 'days_of_week',
        daysOfWeek: sortedDays,
        suggestion: `every ${suggestion}`
      };
    }
  }
  
  // Pattern: "every monday", "every sunday"
  const singleDayMatch = processed.match(new RegExp(`^every\\s+(${dayPattern})$`));
  if (singleDayMatch) {
    const dayName = singleDayMatch[1];
    return {
      type: 'days_of_week',
      daysOfWeek: [dayNames[dayName]],
      suggestion: `every ${dayName}`
    };
  }
  
  // Multiple days patterns
  // Pattern: "every sunday and tuesday", "every monday and friday"
  const andPattern = processed.match(new RegExp(`^every\\s+(${dayPattern})\\s+and\\s+(${dayPattern})$`));
  if (andPattern) {
    const day1 = andPattern[1];
    const day2 = andPattern[2];
    const days = [dayNames[day1], dayNames[day2]].sort();
    const daysList = days.map(d => Object.keys(dayNames).find(k => dayNames[k] === d)).join(' and ');
    return {
      type: 'days_of_week',
      daysOfWeek: days,
      suggestion: `every ${daysList}`
    };
  }
  
  // Pattern: "every monday, wednesday", "every tuesday, thursday"
  const multipleDaysMatch = processed.match(new RegExp(`^every\\s+((?:${dayPattern})(?:,\\s*(?:${dayPattern}))*)$`));
  if (multipleDaysMatch) {
    const daysStr = multipleDaysMatch[1];
    const days = daysStr.split(',').map(d => d.trim()).map(d => dayNames[d]).filter(d => d !== undefined);
    if (days.length > 0) {
      const sortedDays = days.sort();
      const daysList = sortedDays.map(d => Object.keys(dayNames).find(k => dayNames[k] === d)).join(', ');
      return {
        type: 'days_of_week',
        daysOfWeek: sortedDays,
        suggestion: `every ${daysList}`
      };
    }
  }
  
  // Pattern: "every monday, wednesday and friday"
  const commaAndPattern = processed.match(new RegExp(`^every\\s+((?:${dayPattern})(?:,\\s*(?:${dayPattern}))*)\\s+and\\s+(${dayPattern})$`));
  if (commaAndPattern) {
    const daysStr = commaAndPattern[1];
    const lastDay = commaAndPattern[2];
    const days = [...daysStr.split(',').map(d => d.trim()), lastDay].map(d => dayNames[d]).filter(d => d !== undefined);
    if (days.length > 0) {
      const sortedDays = days.sort();
      const daysList = sortedDays.map(d => Object.keys(dayNames).find(k => dayNames[k] === d));
      const formattedList = daysList.length > 2 
        ? daysList.slice(0, -1).join(', ') + ' and ' + daysList[daysList.length - 1]
        : daysList.join(' and ');
      return {
        type: 'days_of_week',
        daysOfWeek: sortedDays,
        suggestion: `every ${formattedList}`
      };
    }
  }
  
  // Pattern: "monday and tuesday", "tuesdays and wednesdays" (and combinations without "every")
  const directAndPattern = processed.match(new RegExp(`^(${dayPattern}s?)\\s+and\\s+(${dayPattern}s?)$`));
  if (directAndPattern) {
    let day1Name = directAndPattern[1];
    let day2Name = directAndPattern[2];
    
    // Remove 's' if plural
    if (day1Name.endsWith('s') && day1Name !== 'wednesdays') {
      day1Name = day1Name.slice(0, -1);
    }
    if (day2Name.endsWith('s') && day2Name !== 'wednesdays') {
      day2Name = day2Name.slice(0, -1);
    }
    
    // Special handling for days ending in 's'
    if (day1Name === 'wednesday') day1Name = 'wednesday';
    if (day2Name === 'wednesday') day2Name = 'wednesday';
    
    const day1 = dayNames[day1Name];
    const day2 = dayNames[day2Name];
    
    if (day1 !== undefined && day2 !== undefined) {
      const days = [day1, day2].sort();
      const daysList = days.map(d => {
        const dayName = Object.keys(dayNames).find(k => dayNames[k] === d);
        return dayName + 's'; // Make plural
      }).join(' and ');
      return {
        type: 'days_of_week',
        daysOfWeek: days,
        suggestion: daysList
      };
    }
  }
  
  // Pattern: "mo, tu, wed, thu" (short abbreviations separated by commas)
  const shortAbbrevsMatch = processed.match(/^([a-z]{2,3})(?:,\s*([a-z]{2,3}))+$/);
  if (shortAbbrevsMatch) {
    const shortAbbrevs = processed.split(',').map(s => s.trim());
    const shortToFull: { [key: string]: string } = {
      'mo': 'monday', 'tu': 'tuesday', 'we': 'wednesday', 'th': 'thursday',
      'fr': 'friday', 'sa': 'saturday', 'su': 'sunday',
      'mon': 'monday', 'tue': 'tuesday', 'wed': 'wednesday', 'thu': 'thursday',
      'fri': 'friday', 'sat': 'saturday', 'sun': 'sunday'
    };
    
    const days = shortAbbrevs.map(abbrev => shortToFull[abbrev]).filter(day => day && dayNames[day] !== undefined).map(day => dayNames[day]);
    
    if (days.length > 0) {
      const sortedDays = days.sort();
      const formattedDays = sortedDays.map(d => Object.keys(dayNames).find(k => dayNames[k] === d) + 's');
      const suggestion = formattedDays.length > 2 
        ? formattedDays.slice(0, -1).join(', ') + ' and ' + formattedDays[formattedDays.length - 1]
        : formattedDays.join(' and ');
      return {
        type: 'days_of_week',
        daysOfWeek: sortedDays,
        suggestion: suggestion
      };
    }
  }
  
  return { type: 'invalid' };
}

function generateRecurringDates(startDate: Date, pattern: ParsedPattern, maxDates: number = 50): Date[] {
  const dates: Date[] = [];
  const start = startOfDay(startDate);
  
  if (pattern.type === 'invalid') return dates;
  
  switch (pattern.type) {
    case 'daily':
      for (let i = 0; i < maxDates; i++) {
        dates.push(addDays(start, i * (pattern.interval || 1)));
      }
      break;
      
    case 'weekly':
      for (let i = 0; i < maxDates; i++) {
        dates.push(addWeeks(start, i * (pattern.interval || 1)));
      }
      break;
      
    case 'monthly':
      for (let i = 0; i < maxDates; i++) {
        dates.push(addMonths(start, i * (pattern.interval || 1)));
      }
      break;
      
    case 'yearly':
      for (let i = 0; i < maxDates; i++) {
        dates.push(addYears(start, i * (pattern.interval || 1)));
      }
      break;
      
    case 'days_of_week':
      if (pattern.daysOfWeek) {
        let currentDate = start;
        let dateCount = 0;
        
        // Go back to find the first occurrence
        while (dateCount < maxDates) {
          const dayOfWeek = getDay(currentDate);
          if (pattern.daysOfWeek.includes(dayOfWeek)) {
            dates.push(new Date(currentDate));
            dateCount++;
          }
          currentDate = addDays(currentDate, 1);
        }
      }
      break;
  }
  
  return dates;
}

function getSuggestions(input: string): string[] {
  const normalized = input.toLowerCase().trim();
  
  // Return empty if input is empty - no suggestion needed
  if (normalized === '') {
    return [];
  }
  
  // Intelligent single suggestion based on user intent
  
  // Exact matches for complete patterns
  const exactPatterns = [
    'daily', 'weekly', 'bi-weekly', 'monthly', 'yearly',
    'every day', 'every week', 'every month', 'every year',
    'weekdays', 'weekends', 'on weekends', 'every weekday',
    'mondays', 'tuesdays', 'wednesdays', 'thursdays', 'fridays', 'saturdays', 'sundays',
    'every monday', 'every tuesday', 'every wednesday', 'every thursday', 
    'every friday', 'every saturday', 'every sunday',
    'monday and tuesday', 'tuesday and wednesday', 'wednesday and thursday',
    'thursday and friday', 'friday and saturday', 'saturday and sunday',
    'mondays and tuesdays', 'tuesdays and wednesdays', 'wednesdays and thursdays',
    'thursdays and fridays', 'fridays and saturdays', 'saturdays and sundays',
    'monday and friday', 'tuesday and thursday', 'wednesday and saturday',
    'mondays and fridays', 'tuesdays and thursdays', 'wednesdays and saturdays',
    'mondays and wednesdays', 'thursdays and saturdays', 'fridays and sundays',
    'mondays and fridays', 'tuesdays and thursdays', 'wednesdays and saturdays',
    'mondays and wednesdays', 'thursdays and saturdays', 'fridays and sundays',
    'tuesdays, thursdays', 'mondays, wednesdays', 'mondays, wednesdays, fridays',
    'tuesdays, thursdays, saturdays', 'mondays, tuesdays, wednesdays',
    'mo, tu, wed, thu', 'mo, we, fr', 'tu, th', 'sa, su',
    'mo, tu', 'we, fr', 'th, sa', 'mo, wed, fri'
  ];
  
  // Check for exact matches first
  for (const pattern of exactPatterns) {
    if (pattern === normalized) {
      return [pattern];
    }
  }
  
  // Intent-based intelligent suggestions for partial inputs
  
  // "d" -> "daily" (most common d pattern)
  if (normalized === 'd') {
    return ['daily'];
  }
  
  // "da" -> "daily"
  if ('daily'.startsWith(normalized) && normalized.length >= 2) {
    return ['daily'];
  }
  
  // "w" -> "weekdays" (more common than weekends)
  if (normalized === 'w') {
    return ['weekdays'];
  }
  
  // "we" -> could be weekdays, weekends, or weekly - choose weekdays as most common
  if (normalized === 'we') {
    return ['weekdays'];
  }
  
  // "wee" -> "weekly" (user is typing weekly)
  if ('weekly'.startsWith(normalized) && normalized.length >= 3) {
    return ['weekly'];
  }
  
  // "week" -> "weekdays" (more common than weekend or weekly)
  if ('weekdays'.startsWith(normalized) && normalized !== 'weeke' && normalized !== 'weekl') {
    return ['weekdays'];
  }
  
  // "weekl" -> "weekly"
  if ('weekly'.startsWith(normalized) && normalized.length >= 5) {
    return ['weekly'];
  }
  
  // "weeke" -> "weekends" (user is clearly typing weekends)
  if ('weekends'.startsWith(normalized) && normalized.length >= 5) {
    return ['weekends'];
  }
  
  // "bi" -> "bi-weekly"
  if (normalized === 'bi' || 'bi-weekly'.startsWith(normalized)) {
    return ['bi-weekly'];
  }
  
  // "m" -> "monthly" (if not clearly monday-related)
  if (normalized === 'm') {
    return ['monthly'];
  }
  
  // "mon" -> "mondays" (if user is typing monday)
  if ('mondays'.startsWith(normalized) && normalized.length <= 3) {
    return ['mondays'];
  }
  
  // "mont" -> "monthly" (if user is typing monthly)
  if ('monthly'.startsWith(normalized) && normalized.length >= 4) {
    return ['monthly'];
  }
  
  // "y" -> "yearly"
  if (normalized === 'y' || 'yearly'.startsWith(normalized)) {
    return ['yearly'];
  }
  
  // "o" or "on" -> "on weekends"
  if (normalized === 'o' || normalized === 'on') {
    return ['on weekends'];
  }
  
  // "on " -> "on weekends"
  if (normalized === 'on ') {
    return ['on weekends'];
  }
  
  // Handle "every" prefix
  if (normalized.startsWith('every')) {
    const afterEvery = normalized.substring(5).trim();
    
    // "every" -> "every day" (most common)
    if (afterEvery === '') {
      return ['every day'];
    }
    
    // "every " -> "every day"
    if (afterEvery === '') {
      return ['every day'];
    }
    
    // "every d" -> "every day"
    if ('day'.startsWith(afterEvery)) {
      return ['every day'];
    }
    
    // "every w" -> "every weekday" (more common than week)
    if (afterEvery === 'w') {
      return ['every weekday'];
    }
    
    // "every we" -> "every weekday"
    if ('weekday'.startsWith(afterEvery) && afterEvery !== 'week') {
      return ['every weekday'];
    }
    
    // "every week" -> "every week"
    if (afterEvery === 'week') {
      return ['every week'];
    }
    
    // "every m" -> "every monday" (most common m day)
    if (afterEvery === 'm') {
      return ['every monday'];
    }
    
    // "every mon" -> "every monday" or "every month"
    if (afterEvery === 'mon') {
      return ['every monday'];
    }
    
    // "every mont" -> "every month"
    if ('month'.startsWith(afterEvery) && afterEvery.length >= 4) {
      return ['every month'];
    }
    
    // "every y" -> "every year"
    if (afterEvery === 'y' || 'year'.startsWith(afterEvery)) {
      return ['every year'];
    }
    
    // Handle written numbers in "every" patterns
    const writtenNumbers = ['two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
    const ordinalNumbers = ['second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'];
    const numberMap: { [key: string]: string } = { 
      'two': '2', 'three': '3', 'four': '4', 'five': '5',
      'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', 'ten': '10',
      'second': '2', 'third': '3', 'fourth': '4', 'fifth': '5',
      'sixth': '6', 'seventh': '7', 'eighth': '8', 'ninth': '9', 'tenth': '10'
    };
    
    // Handle written/ordinal numbers
    const allNumbers = [...writtenNumbers, ...ordinalNumbers];
    for (const num of allNumbers) {
      if (afterEvery.startsWith(num)) {
        const rest = afterEvery.substring(num.length).trim();
        // Only default to days if there's no partial unit being typed
        if (rest === '' || rest === ' ') {
          // Check if user might be typing a unit by looking at the original input
          const originalAfterEvery = input.substring(input.toLowerCase().indexOf('every') + 5).trim();
          const afterNumber = originalAfterEvery.substring(num.length).trim();
          
          // If there's more text after the number, don't suggest anything yet
          if (afterNumber.length > 0) {
            return [];
          }
          return [`every ${numberMap[num]} days`];
        }
        if (rest.startsWith(' d') || rest === ' days' || rest === ' day') {
          return [`every ${numberMap[num]} days`];
        }
        if (rest.startsWith(' w') || rest === ' weeks' || rest === ' week') {
          return [`every ${numberMap[num]} weeks`];
        }
        if (rest.startsWith(' m') || rest === ' months' || rest === ' month') {
          return [`every ${numberMap[num]} months`];
        }
        if (rest.startsWith(' y') || rest === ' years' || rest === ' year') {
          return [`every ${numberMap[num]} years`];
        }
        // If there's a partial unit, try to detect what they're typing
        if (rest.startsWith(' ')) {
          const unit = rest.substring(1);
          if ('days'.startsWith(unit) || 'day'.startsWith(unit)) {
            return [`every ${numberMap[num]} days`];
          }
          if ('weeks'.startsWith(unit) || 'week'.startsWith(unit)) {
            return [`every ${numberMap[num]} weeks`];
          }
          if ('months'.startsWith(unit) || 'month'.startsWith(unit)) {
            return [`every ${numberMap[num]} months`];
          }
          if ('years'.startsWith(unit) || 'year'.startsWith(unit)) {
            return [`every ${numberMap[num]} years`];
          }
        }
      }
    }
    
    // Handle day completions
    const dayMappings = {
      'mon': 'every monday',
      'tue': 'every tuesday', 
      'wed': 'every wednesday',
      'thu': 'every thursday',
      'fri': 'every friday',
      'sat': 'every saturday',
      'sun': 'every sunday'
    };
    
    for (const [abbrev, fullForm] of Object.entries(dayMappings)) {
      if (abbrev.startsWith(afterEvery)) {
        return [fullForm];
      }
    }
  }
  
  // Handle day abbreviations without "every"
  const dayAbbrevMappings = {
    'mon': 'mondays',
    'tue': 'tuesdays',
    'wed': 'wednesdays', 
    'thu': 'thursdays',
    'fri': 'fridays',
    'sat': 'saturdays',
    'sun': 'sundays'
  };
  
  for (const [abbrev, plural] of Object.entries(dayAbbrevMappings)) {
    if (abbrev.startsWith(normalized)) {
      return [plural];
    }
  }
  
  // Handle single letter day hints
  const singleLetterDays: { [key: string]: string } = {
    't': 'tuesdays',    // tuesday is most common t day  
    'f': 'fridays',     // friday is most common f day
    's': 'sundays'      // sunday more common than saturday
  };
  
  if (singleLetterDays[normalized]) {
    return [singleLetterDays[normalized]];
  }
  
  // Handle "and" patterns for days
  if (normalized.includes(' and ')) {
    const parts = normalized.split(' and ');
    if (parts.length === 2) {
      const [first, second] = parts.map(s => s.trim());
      
      // Check if both parts are day abbreviations or full names (singular or plural)
      const dayAbbrevs = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
      const dayFullNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      const dayPluralNames = ['mondays', 'tuesdays', 'wednesdays', 'thursdays', 'fridays', 'saturdays', 'sundays'];
      
      let firstDay = '';
      let secondDay = '';
      
      // Find matching days for first part
      for (const abbrev of dayAbbrevs) {
        if (abbrev.startsWith(first.toLowerCase())) {
          firstDay = abbrev === 'tue' ? 'tuesday' : 
                    abbrev === 'wed' ? 'wednesday' : 
                    abbrev === 'thu' ? 'thursday' : 
                    abbrev === 'sat' ? 'saturday' : 
                    abbrev === 'sun' ? 'sunday' : abbrev + 'day';
          break;
        }
      }
      
      // Check full names and plurals for first part
      if (!firstDay) {
        for (const fullName of dayFullNames) {
          if (fullName.startsWith(first.toLowerCase())) {
            firstDay = fullName;
            break;
          }
        }
      }
      
      if (!firstDay) {
        for (const pluralName of dayPluralNames) {
          if (pluralName.startsWith(first.toLowerCase())) {
            firstDay = pluralName.slice(0, -1); // Remove 's'
            if (firstDay === 'wednesday') firstDay = 'wednesday';
            break;
          }
        }
      }
      
      // Find matching days for second part
      for (const abbrev of dayAbbrevs) {
        if (abbrev.startsWith(second.toLowerCase())) {
          secondDay = abbrev === 'tue' ? 'tuesday' : 
                     abbrev === 'wed' ? 'wednesday' : 
                     abbrev === 'thu' ? 'thursday' : 
                     abbrev === 'sat' ? 'saturday' : 
                     abbrev === 'sun' ? 'sunday' : abbrev + 'day';
          break;
        }
      }
      
      // Check full names and plurals for second part
      if (!secondDay) {
        for (const fullName of dayFullNames) {
          if (fullName.startsWith(second.toLowerCase())) {
            secondDay = fullName;
            break;
          }
        }
      }
      
      if (!secondDay) {
        for (const pluralName of dayPluralNames) {
          if (pluralName.startsWith(second.toLowerCase())) {
            secondDay = pluralName.slice(0, -1); // Remove 's'
            if (secondDay === 'wednesday') secondDay = 'wednesday';
            break;
          }
        }
      }
      
      if (firstDay && secondDay) {
        return [`${firstDay}s and ${secondDay}s`];
      }
    }
  }
  
  // Handle comma patterns for multiple days
  if (normalized.includes(',')) {
    const parts = normalized.split(',').map(s => s.trim());
    const lastPart = parts[parts.length - 1];
    
    // Handle short abbreviations
    const shortToFull: { [key: string]: string } = {
      'mo': 'mondays', 'tu': 'tuesdays', 'we': 'wednesdays', 'th': 'thursdays',
      'fr': 'fridays', 'sa': 'saturdays', 'su': 'sundays',
      'mon': 'mondays', 'tue': 'tuesdays', 'wed': 'wednesdays', 'thu': 'thursdays',
      'fri': 'fridays', 'sat': 'saturdays', 'sun': 'sundays'
    };
    
    // If user is typing after comma, suggest completion
    if (lastPart.length > 0) {
      // Check for short abbreviation completion
      for (const [abbrev, plural] of Object.entries(shortToFull)) {
        if (abbrev.startsWith(lastPart)) {
          const completedParts = [...parts.slice(0, -1), abbrev];
          return [completedParts.join(', ')];
        }
      }
      
      // Original day abbreviation mappings
      const dayAbbrevMappings = {
        'mon': 'mondays',
        'tue': 'tuesdays',
        'wed': 'wednesdays', 
        'thu': 'thursdays',
        'fri': 'fridays',
        'sat': 'saturdays',
        'sun': 'sundays'
      };
      
      for (const [abbrev, plural] of Object.entries(dayAbbrevMappings)) {
        if (abbrev.startsWith(lastPart)) {
          const completedParts = [...parts.slice(0, -1), plural];
          return [completedParts.join(', ')];
        }
      }
    }
    
    // Common comma combinations (including short forms)
    const commaPatterns = [
      'mo, tu, wed, thu',
      'mo, we, fr',
      'tu, th',
      'sa, su',
      'tuesdays, thursdays',
      'mondays, wednesdays', 
      'mondays, wednesdays, fridays',
      'tuesdays, thursdays, saturdays'
    ];
    
    for (const pattern of commaPatterns) {
      if (pattern.startsWith(normalized)) {
        return [pattern];
      }
    }
  }
  
  // Handle number patterns
  const numberMatch = normalized.match(/^every (\d+)/);
  if (numberMatch) {
    const num = parseInt(numberMatch[1]);
    if (num >= 2 && num <= 365) {  // Allow up to 365 days (1 year)
      // Check if user is typing a unit after the number
      const afterNumber = normalized.substring(`every ${num}`.length);
      
      // If there's text after the number, try to detect the unit
      if (afterNumber.length > 0) {
        // Handle both with and without spaces: "every 2 w" and "every 2w"
        const unit = afterNumber.startsWith(' ') ? afterNumber.substring(1) : afterNumber;
        
        if ('days'.startsWith(unit) || 'day'.startsWith(unit)) {
          return [`every ${num} days`];
        }
        if ('weeks'.startsWith(unit) || 'week'.startsWith(unit)) {
          return [`every ${num} weeks`];
        }
        if ('months'.startsWith(unit) || 'month'.startsWith(unit)) {
          return [`every ${num} months`];
        }
        if ('years'.startsWith(unit) || 'year'.startsWith(unit)) {
          return [`every ${num} years`];
        }
        
        // If we can't match the unit, don't suggest anything yet
        return [];
      }
      
      // Only default to days if user hasn't started typing a unit
      if (num <= 30) {
        return [`every ${num} days`];
      } else {
        // For larger numbers, suggest the most appropriate unit
        if (num % 30 === 0 && num <= 365) {
          const months = num / 30;
          return [`every ${months} months`];
        } else if (num % 7 === 0 && num <= 84) {  // Up to 12 weeks
          const weeks = num / 7;
          return [`every ${weeks} weeks`];
        } else {
          return [`every ${num} days`];
        }
      }
    }
  }
  
  // Handle standalone numbers (1, 2, 3, etc.) to suggest "every X days"
  const standaloneNumberMatch = normalized.match(/^(\d+)$/);
  if (standaloneNumberMatch) {
    const num = parseInt(standaloneNumberMatch[1]);
    if (num >= 1 && num <= 365) {
      return [`every ${num} days`];
    }
  }
  
  // Handle written numbers when typed directly (outside "every")
  const writtenToDigit: { [key: string]: string } = {
    'two': '2', 'three': '3', 'four': '4', 'five': '5',
    'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', 'ten': '10',
    'second': '2', 'third': '3', 'fourth': '4', 'fifth': '5',
    'sixth': '6', 'seventh': '7', 'eighth': '8', 'ninth': '9', 'tenth': '10'
  };
  
  for (const [written, digit] of Object.entries(writtenToDigit)) {
    if (normalized.startsWith(written)) {
      const rest = normalized.substring(written.length).trim();
      if (rest === '' || rest === ' ') {
        // Check if user might be typing a unit by looking at the original input
        const originalRest = input.substring(written.length).trim();
        
        // If there's more text after the number, don't suggest anything yet
        if (originalRest.length > 0 && originalRest !== ' ') {
          return [];
        }
        return [`every ${digit} days`];
      }
      if (rest.startsWith(' d') || rest === ' days' || rest === ' day') {
        return [`every ${digit} days`];
      }
      if (rest.startsWith(' w') || rest === ' weeks' || rest === ' week') {
        return [`every ${digit} weeks`];
      }
      if (rest.startsWith(' m') || rest === ' months' || rest === ' month') {
        return [`every ${digit} months`];
      }
      if (rest.startsWith(' y') || rest === ' years' || rest === ' year') {
        return [`every ${digit} years`];
      }
      // If there's a partial unit, try to detect what they're typing
      if (rest.startsWith(' ')) {
        const unit = rest.substring(1);
        if ('days'.startsWith(unit) || 'day'.startsWith(unit)) {
          return [`every ${digit} days`];
        }
        if ('weeks'.startsWith(unit) || 'week'.startsWith(unit)) {
          return [`every ${digit} weeks`];
        }
        if ('months'.startsWith(unit) || 'month'.startsWith(unit)) {
          return [`every ${digit} months`];
        }
        if ('years'.startsWith(unit) || 'year'.startsWith(unit)) {
          return [`every ${digit} years`];
        }
      }
    }
  }
  
  // Try to find the best partial match from all patterns
  const allPatterns = [
    'daily', 'weekly', 'bi-weekly', 'monthly', 'yearly',
    'every day', 'every 2 days', 'every 3 days', 'every 4 days', 'every 5 days',
    'every 6 days', 'every 7 days', 'every 10 days', 'every 14 days', 'every 21 days', 'every 30 days',
    'every week', 'every 2 weeks', 'every 3 weeks', 'every 4 weeks', 'every 6 weeks',
    'every month', 'every 2 months', 'every 3 months', 'every 4 months', 'every 6 months',
    'every year', 'every 2 years', 'every 3 years', 'every 5 years',
    'every second day', 'every third day', 'every fourth day', 'every fifth day',
    'every second week', 'every third week', 'every fourth week',
    'every second month', 'every third month', 'every sixth month',
    'mondays', 'tuesdays', 'wednesdays', 'thursdays', 'fridays', 'saturdays', 'sundays',
    'every monday', 'every tuesday', 'every wednesday', 'every thursday',
    'every friday', 'every saturday', 'every sunday',
    'every weekday', 'weekdays', 'on weekends', 'weekends',
    'every monday and tuesday', 'every tuesday and thursday', 'every monday and friday',
    'every wednesday and friday', 'every saturday and sunday',
    'monday and tuesday', 'tuesday and thursday', 'wednesday and friday',
    'thursday and saturday', 'friday and sunday', 'saturday and sunday',
    'mondays and tuesdays', 'tuesdays and thursdays', 'wednesdays and fridays',
    'mondays and fridays', 'tuesdays and thursdays', 'wednesdays and saturdays',
    'mondays and wednesdays', 'thursdays and saturdays', 'fridays and sundays',
    'tuesdays, thursdays', 'mondays, wednesdays', 'mondays, wednesdays, fridays',
    'tuesdays, thursdays, saturdays', 'mondays, tuesdays, wednesdays',
    'mo, tu, wed, thu', 'mo, we, fr', 'tu, th', 'sa, su',
    'mo, tu', 'we, fr', 'th, sa', 'mo, wed, fri'
  ];
  
  // Find best starts-with match (prioritize shorter/simpler patterns)
  for (const pattern of allPatterns) {
    if (pattern.toLowerCase().startsWith(normalized)) {
      return [pattern];
    }
  }
  
  // Handle single short abbreviations
  const shortAbbrevToPattern: { [key: string]: string } = {
    'mo': 'mo, tu, wed, thu',
    'tu': 'tu, th',
    'we': 'mo, we, fr',
    'th': 'tu, th',
    'fr': 'mo, we, fr',
    'sa': 'sa, su',
    'su': 'sa, su'
  };
  
  if (shortAbbrevToPattern[normalized]) {
    return [shortAbbrevToPattern[normalized]];
  }
  
  // If no good match, return empty (no suggestion)
  return [];
}

// Shared utility function for parsing task dates
function parseTaskDate(dateString: string | undefined | null): Date | undefined {
  if (!dateString || dateString.trim() === '') return undefined;
  try {
    const dateToParseString = dateString.includes('T') ? dateString : dateString + 'T00:00:00';
    const parsedDate = parseISO(dateToParseString);
    if (isNaN(parsedDate.getTime())) return undefined;
    return parsedDate;
  } catch (error) {
    return undefined;
  }
}

export function RecurringTaskList({
  tasks: externalTasks,
  userId,
  onAddTask,
  onUpdateTask,
  onDeleteTask
}: {
  tasks?: RecurringTask[];
  userId: string;
  onAddTask?: (task: Omit<RecurringTask, 'id'>) => void;
  onUpdateTask?: (id: string, updates: Partial<RecurringTask>) => void;
  onDeleteTask?: (id: string) => void;
}) {
  const tasks = externalTasks ?? [];
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [showCompletedAnimation, setShowCompletedAnimation] = useState(false);
  const [swipeStartX, setSwipeStartX] = useState<number | null>(null);
  const [swipeDistance, setSwipeDistance] = useState(0);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [emptyTaskData, setEmptyTaskData] = useState({ name: '', description: '' });
  const lastTaskInputRef = useRef<HTMLInputElement | null>(null);
  const shouldFocusNewTaskRef = useRef(false);
  const focusAttemptCountRef = useRef(0);
  const maintainFocusRef = useRef(false);
  const focusedTaskPositionRef = useRef<number>(-1);

  const sortedTasks = tasks.sort((a, b) => {
    const dateA = new Date(a.dueDate).getTime();
    const dateB = new Date(b.dueDate).getTime();
    return dateA - dateB;
  });

  const displayTasks = sortedTasks.length > 0 ? sortedTasks : [{
    id: 'empty',
    name: emptyTaskData.name,
    description: emptyTaskData.description,
    dueDate: '',
    completed: false,
    userId: '',
  }];

  const focusTaskInput = useCallback((taskId: string) => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        const taskNameInput = document.querySelector(
          `input.task-input[data-task-id="${taskId}"]`
        ) as HTMLInputElement;

        if (taskNameInput) {
          if (document.activeElement !== taskNameInput) {
            console.log('Focusing recurring task input:', taskId);
            taskNameInput.focus();
            taskNameInput.setSelectionRange(0, 0);
            lastTaskInputRef.current = taskNameInput;
            maintainFocusRef.current = true;
            
            const taskIndex = sortedTasks.findIndex(t => t.id === taskId);
            focusedTaskPositionRef.current = taskIndex;
            console.log('Set focused task position to:', taskIndex);
          }
        } else {
          console.log('Recurring task input not found for ID:', taskId);
        }
      }, 10);
    });
  }, [sortedTasks]);

  const focusLastEmptyTask = useCallback(() => {
    console.log('Attempting to focus last empty recurring task, sortedTasks length:', sortedTasks.length);
    
    for (let i = sortedTasks.length - 1; i >= 0; i--) {
      const task = sortedTasks[i];
      if (task.name === '' && task.id !== 'empty') {
        console.log('Found empty recurring task to focus:', task.id);
        focusTaskInput(task.id);
        return true;
      }
    }
    
    if (sortedTasks.length === 1 && sortedTasks[0].name === '' && sortedTasks[0].id !== 'empty') {
      console.log('Focusing single empty recurring task:', sortedTasks[0].id);
      focusTaskInput(sortedTasks[0].id);
      return true;
    }
    
    console.log('No empty recurring task found to focus');
    return false;
  }, [sortedTasks, focusTaskInput]);

  useEffect(() => {
    if (maintainFocusRef.current && focusedTaskPositionRef.current >= 0) {
      const targetPosition = focusedTaskPositionRef.current;
      console.log('Attempting to maintain focus at position:', targetPosition);
      
      if (sortedTasks[targetPosition] && sortedTasks[targetPosition].id !== 'empty') {
        const taskId = sortedTasks[targetPosition].id;
        console.log('Re-focusing recurring task at position', targetPosition, 'with ID:', taskId);
        
        requestAnimationFrame(() => {
          setTimeout(() => {
            const taskNameInput = document.querySelector(
              `input.task-input[data-task-id="${taskId}"]`
            ) as HTMLInputElement;

            if (taskNameInput && document.activeElement !== taskNameInput) {
              taskNameInput.focus();
              taskNameInput.setSelectionRange(0, 0);
              lastTaskInputRef.current = taskNameInput;
              console.log('Focus restored to:', taskId);
            }
          }, 5);
        });
      }
    }
  }, [sortedTasks]);

  useEffect(() => {
    if (shouldFocusNewTaskRef.current && focusAttemptCountRef.current < 3) {
      focusAttemptCountRef.current++;
      console.log('Focus attempt #', focusAttemptCountRef.current);
      
      const focused = focusLastEmptyTask();
      
      if (focused) {
        shouldFocusNewTaskRef.current = false;
        focusAttemptCountRef.current = 0;
      } else if (focusAttemptCountRef.current >= 3) {
        console.log('Giving up focus attempts');
        shouldFocusNewTaskRef.current = false;
        focusAttemptCountRef.current = 0;
        maintainFocusRef.current = false;
      }
    }
  }, [sortedTasks, tasks, focusLastEmptyTask]);

  const formatDate = (date: string) => {
    if (!date) return '';
    const parsedDate = parseTaskDate(date);
    if (!parsedDate) return '';
    
    if (isToday(parsedDate)) return 'Today';
    if (isYesterday(parsedDate)) return 'Yesterday';
    if (isTomorrow(parsedDate)) return 'Tomorrow';
    
    const daysDiff = Math.ceil((parsedDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff >= 2 && daysDiff <= 6) {
      return format(parsedDate, 'EEEE');
    }
    
    return format(parsedDate, 'MMM d');
  };

  const addNewTask = () => {
    if (onAddTask && userId) {
      console.log('Adding new recurring task...');
      shouldFocusNewTaskRef.current = true;
      focusAttemptCountRef.current = 0;
      onAddTask({
        name: '',
        description: '',
        dueDate: '',
        completed: false,
        userId,
      });
    }
  };

  const updateTask = (id: string, updates: Partial<RecurringTask>) => {
    if (id === 'empty') {
      setEmptyTaskData(prev => ({
        name: typeof updates.name === 'string' ? updates.name : prev.name,
        description: typeof updates.description === 'string' ? updates.description : prev.description,
      }));
    } else if (onUpdateTask) {
      const currentFocusedTask = sortedTasks[focusedTaskPositionRef.current];
      if (currentFocusedTask && currentFocusedTask.id === id && updates.name && updates.name !== '') {
        console.log('Recurring task got a name, stopping focus maintenance');
        maintainFocusRef.current = false;
        focusedTaskPositionRef.current = -1;
      }

      if (updates.completed !== undefined) {
        const now = format(new Date(), 'yyyy-MM-dd');
        
        // If completing a recurring task, calculate the next occurrence
        if (updates.completed) {
          const task = tasks.find(t => t.id === id);
          if (task && task.recurrencePattern && task.dueDate) {
            const parsedPattern = parseRecurrencePattern(task.recurrencePattern);
            if (parsedPattern.type !== 'invalid') {
              const currentDueDate = parseTaskDate(task.dueDate);
              if (currentDueDate) {
                const nextOccurrence = findNextOccurrenceAfterDate(currentDueDate, parsedPattern);
                if (nextOccurrence) {
                  // Update to next occurrence and mark as not completed
                  const updatedTask = {
                    ...updates,
                    completed: false,
                    completedAt: undefined,
                    dueDate: format(nextOccurrence, 'yyyy-MM-dd')
                  };
                  onUpdateTask(id, updatedTask);
                  
                  setShowCompletedAnimation(true);
                  setTimeout(() => setShowCompletedAnimation(false), 1500);
                  return;
                }
              }
            }
          }
        }
        
        // Handle non-recurring task completion or unchecking
        const updatedTask = {
          ...updates,
          completedAt: updates.completed ? now : undefined
        };
        onUpdateTask(id, updatedTask);
        
        if (updates.completed) {
          setShowCompletedAnimation(true);
          setTimeout(() => setShowCompletedAnimation(false), 1500);
        }
      } else {
        onUpdateTask(id, updates);
      }
    }
  };

  const deleteTask = (taskId: string) => {
    if (onDeleteTask) {
      const taskIndex = sortedTasks.findIndex(t => t.id === taskId);
      onDeleteTask(taskId);
      
      requestAnimationFrame(() => {
        const taskInputs = document.querySelectorAll('.recurring-task-container .task-input[data-task-id]');
        const targetIndex = Math.min(taskIndex, taskInputs.length - 1);
        if (targetIndex >= 0) {
          (taskInputs[targetIndex] as HTMLInputElement)?.focus();
        }
      });
    }
  };

  const handleKeyDown = async (e: KeyboardEvent<HTMLInputElement>, taskId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (taskId === 'empty') {
        if (emptyTaskData.name.trim() !== '') {
          if (onAddTask && userId) {
            console.log('Adding recurring task from empty row...');
            shouldFocusNewTaskRef.current = true;
            focusAttemptCountRef.current = 0;
            onAddTask({
              name: emptyTaskData.name.trim(),
              description: emptyTaskData.description.trim(),
              dueDate: '',
              completed: false,
              userId,
            });
            setEmptyTaskData({ name: '', description: '' });
          }
        }
      } else {
        const task = tasks.find(t => t.id === taskId);
        if (task && task.name.trim() !== '') {
          addNewTask();
        }
      }
    } else if (e.key === 'Backspace' && taskId !== 'empty') {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      if (e.currentTarget.selectionStart === 0 && e.currentTarget.selectionEnd === 0) {
        const taskName = typeof task.name === 'string' ? task.name : '';
        const taskDescription = typeof task.description === 'string' ? task.description : '';
        if (taskName.trim() === '' && taskDescription.trim() === '') {
          deleteTask(taskId);
        }
      }
    }
  };

  const handleTouchStart = (e: TouchEvent, taskId: string) => {
    setSwipeStartX(e.touches[0].clientX);
    setTaskToDelete(taskId);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (swipeStartX === null) return;
    const currentX = e.touches[0].clientX;
    const distance = Math.max(0, swipeStartX - currentX);
    setSwipeDistance(distance);
  };

  const handleTouchEnd = () => {
    if (swipeDistance >= 100 && taskToDelete) {
      deleteTask(taskToDelete);
    }
    setSwipeStartX(null);
    setSwipeDistance(0);
    setTaskToDelete(null);
  };

  return (
    <div className="w-full flex items-start justify-center recurring-task-container">
      <div className="w-full max-w-2xl px-4 bg-task-light dark:bg-task-dark rounded-lg mb-4">
        <div className="p-4">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center justify-between w-full text-left"
          >
            <span className="text-xs text-foreground task-tab">Recurring Tasks</span>
            {isCollapsed ? (
              <ChevronDown className="size-4 text-muted-foreground" />
            ) : (
              <ChevronUp className="size-4 text-muted-foreground" />
            )}
          </button>
        </div>
        
        {!isCollapsed && (
          <div className="space-y-2 py-0 px-4 pb-4">
            {displayTasks.map(task => (
              <div
                key={task.id}
                className="relative group"
                onTouchStart={(e) => handleTouchStart(e, task.id)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{ opacity: taskToDelete === task.id ? (1 - swipeDistance / 100) : 1 }}
              >
                {taskToDelete === task.id && swipeDistance > 10 && (
                   <div className="absolute inset-y-0 right-0 flex items-center justify-end bg-red-500 text-white text-xs px-2 rounded-r-lg pointer-events-none" style={{ width: `${swipeDistance}%`, maxWidth: '100px' }}>
                     Delete
                   </div>
                )}
                <div
                  className={cn(
                    "bg-task-light dark:bg-task-dark rounded-lg p-2 transition-transform flex items-start gap-2",
                    { "transform -translate-x-full": taskToDelete === task.id && swipeDistance >= 100 }
                  )}
                  style={{ transform: taskToDelete === task.id ? `translateX(-${swipeDistance}px)` : 'none' }}
                >
                  <button 
                    className="mt-1 text-foreground hover:text-foreground transition-colors"
                    onClick={() => updateTask(task.id, { completed: !task.completed })}
                  >
                    <Check className="size-3" />
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <input
                          type="text"
                          value={typeof task.name === 'string' ? task.name : ''}
                          onChange={(e) => updateTask(task.id, { name: e.target.value })}
                          onKeyDown={(e) => handleKeyDown(e, task.id)}
                          className="flex-1 bg-transparent text-xs font-medium focus:outline-none task-input"
                          data-task-id={task.id}
                          placeholder={task.id === 'empty' ? "Task Name" : "Task name"}
                        />
                        <input
                          type="text"
                          value={typeof task.description === 'string' ? task.description : ''}
                          onChange={(e) => updateTask(task.id, { description: e.target.value })}
                          onKeyDown={(e) => handleKeyDown(e, task.id)}
                          className="flex-1 bg-transparent text-xs text-muted-foreground focus:outline-none task-input"
                          placeholder="Description"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground whitespace-nowrap min-w-[60px] flex justify-end">
                          {task.dueDate ? (
                            <Popover>
                              <PopoverTrigger asChild>
                                <button className="text-muted-foreground hover:text-foreground task-calendar-date">
                                  {formatDate(task.dueDate)}
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0 border-0 rounded-none task-calendar" align="end">
                                <CustomCalendar
                                  selectedDate={parseTaskDate(task.dueDate)}
                                  onDateSelect={(date) => {
                                    updateTask(task.id, { dueDate: date ? format(date, 'yyyy-MM-dd') : '' });
                                  }}
                                  recurringDates={(() => {
                                    if (task.recurrencePattern && task.dueDate) {
                                      const parsed = parseRecurrencePattern(task.recurrencePattern);
                                      console.log('Parsed pattern:', parsed, 'for task:', task.id);
                                      if (parsed.type !== 'invalid') {
                                        const startDate = parseTaskDate(task.dueDate);
                                        console.log('Start date:', startDate, 'from dueDate:', task.dueDate);
                                        if (startDate) {
                                          const dates = generateRecurringDates(startDate, parsed);
                                          console.log('Generated recurring dates:', dates.length, 'dates for task:', task.id);
                                          return dates;
                                        }
                                      }
                                    }
                                    return [];
                                  })()}
                                />
                                {task.id !== 'empty' && (
                                  <RecurringSettings
                                    task={task}
                                    onUpdate={(updates) => updateTask(task.id, updates)}
                                  />
                                )}
                              </PopoverContent>
                            </Popover>
                          ) : (
                            <Popover>
                              <PopoverTrigger asChild>
                                <button className="text-muted-foreground hover:text-foreground task-calendar-date flex justify-center">
                                  <Calendar className="size-3" />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0 border-0 rounded-none task-calendar" align="end">
                                <CustomCalendar
                                  selectedDate={parseTaskDate(task.dueDate)}
                                  onDateSelect={(date) => {
                                    updateTask(task.id, { dueDate: date ? format(date, 'yyyy-MM-dd') : '' });
                                  }}
                                  recurringDates={(() => {
                                    if (task.recurrencePattern && task.dueDate) {
                                      const parsed = parseRecurrencePattern(task.recurrencePattern);
                                      console.log('Parsed pattern:', parsed, 'for task:', task.id);
                                      if (parsed.type !== 'invalid') {
                                        const startDate = parseTaskDate(task.dueDate);
                                        console.log('Start date:', startDate, 'from dueDate:', task.dueDate);
                                        if (startDate) {
                                          const dates = generateRecurringDates(startDate, parsed);
                                          console.log('Generated recurring dates:', dates.length, 'dates for task:', task.id);
                                          return dates;
                                        }
                                      }
                                    }
                                    return [];
                                  })()}
                                />
                                {task.id !== 'empty' && (
                                  <RecurringSettings
                                    task={task}
                                    onUpdate={(updates) => updateTask(task.id, updates)}
                                  />
                                )}
                              </PopoverContent>
                            </Popover>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function findNextDateForPattern(startDate: Date, pattern: ParsedPattern): Date | null {
  if (pattern.type === 'invalid') return null;
  
  const today = startOfDay(startDate);
  
  switch (pattern.type) {
    case 'daily':
      // For daily patterns, start today
      return today;
      
    case 'weekly':
      // For weekly patterns, start today
      return today;
      
    case 'monthly':
      // For monthly patterns, start today
      return today;
      
    case 'yearly':
      // For yearly patterns, start today
      return today;
      
    case 'days_of_week':
      if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
        // Find the next occurrence of any of the specified days
        let currentDate = today;
        
        // Check if today is one of the target days
        const todayDayOfWeek = getDay(currentDate);
        if (pattern.daysOfWeek.includes(todayDayOfWeek)) {
          return currentDate;
        }
        
        // Otherwise, find the next occurrence
        for (let i = 1; i <= 7; i++) {
          currentDate = addDays(today, i);
          const dayOfWeek = getDay(currentDate);
          if (pattern.daysOfWeek.includes(dayOfWeek)) {
            return currentDate;
          }
        }
      }
      return null;
      
    default:
      return null;
  }
}

function findNextOccurrenceAfterDate(currentDate: Date, pattern: ParsedPattern): Date | null {
  if (pattern.type === 'invalid') return null;
  
  const current = startOfDay(currentDate);
  
  switch (pattern.type) {
    case 'daily':
      return addDays(current, pattern.interval || 1);
      
    case 'weekly':
      return addWeeks(current, pattern.interval || 1);
      
    case 'monthly':
      return addMonths(current, pattern.interval || 1);
      
    case 'yearly':
      return addYears(current, pattern.interval || 1);
      
    case 'days_of_week':
      if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
        // Find the next occurrence of any of the specified days after the current date
        let nextDate = addDays(current, 1);
        
        // Look for the next occurrence within the next 7 days
        for (let i = 1; i <= 7; i++) {
          const dayOfWeek = getDay(nextDate);
          if (pattern.daysOfWeek.includes(dayOfWeek)) {
            return nextDate;
          }
          nextDate = addDays(nextDate, 1);
        }
      }
      return null;
      
    default:
      return null;
  }
}

function RecurringSettings({ 
  task, 
  onUpdate 
}: { 
  task: RecurringTask; 
  onUpdate: (updates: Partial<RecurringTask>) => void;
}) {
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [suggestion, setSuggestion] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (value: string) => {
    // Parse the pattern to check if it's valid
    const parsed = parseRecurrencePattern(value);
    
    if (parsed.type !== 'invalid' && value.trim() !== '') {
      // Calculate the next appropriate date starting from today
      const today = new Date();
      const nextDate = findNextDateForPattern(today, parsed);
      
      // Update both pattern and due date
      onUpdate({ 
        recurrencePattern: value,
        dueDate: nextDate ? format(nextDate, 'yyyy-MM-dd') : ''
      });
    } else {
      // Just update the pattern if invalid or empty
    onUpdate({ recurrencePattern: value });
    }
    
    // Update suggestion
    const newSuggestions = getSuggestions(value);
    const newSuggestion = newSuggestions[0] || '';
    setSuggestion(newSuggestion);
    setShowSuggestion(newSuggestion.length > 0 && value.length > 0 && newSuggestion !== value);
  };

  const selectSuggestion = () => {
    if (suggestion) {
      // Parse the suggestion pattern to check if it's valid
      const parsed = parseRecurrencePattern(suggestion);
      
      if (parsed.type !== 'invalid') {
        // Calculate the next appropriate date starting from today
        const today = new Date();
        const nextDate = findNextDateForPattern(today, parsed);
        
        // Update both pattern and due date
        onUpdate({ 
          recurrencePattern: suggestion,
          dueDate: nextDate ? format(nextDate, 'yyyy-MM-dd') : ''
        });
      } else {
        // Just update the pattern if invalid
    onUpdate({ recurrencePattern: suggestion });
      }
      
      setShowSuggestion(false);
    inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab' && showSuggestion) {
      e.preventDefault();
      selectSuggestion();
    }
  };

  return (
    <div className="px-2 py-1.5 border-t border-border">
      <div className="flex items-center gap-1 mb-1.5">
        <Repeat className="size-2 text-muted-foreground" />
        <span className="text-[0.6rem] text-foreground task-tab">Repeat</span>
      </div>
      
      <div className="relative max-w-[140px]">
        <input
          ref={inputRef}
          type="text"
          value={task.recurrencePattern || ''}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            const newSuggestions = getSuggestions(task.recurrencePattern || '');
            const newSuggestion = newSuggestions[0] || '';
            setSuggestion(newSuggestion);
            setShowSuggestion(newSuggestion.length > 0 && (task.recurrencePattern || '').length > 0 && newSuggestion !== (task.recurrencePattern || ''));
          }}
          onBlur={() => {
            // Delay hiding suggestion to allow clicking on it
            setTimeout(() => setShowSuggestion(false), 150);
          }}
          placeholder="mo, we, fr"
          className="w-full text-[0.6rem] text-foreground task-tab bg-background border border-border rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-ring"
        />
        
        {showSuggestion && suggestion && (
          <div className="absolute top-full inset-x-0 z-50 mt-1 bg-background border border-border rounded shadow-lg">
              <button
              onClick={selectSuggestion}
              className="w-full text-left px-1 py-0.5 text-[0.6rem] hover:bg-accent hover:text-accent-foreground flex items-center justify-between"
              >
              <span>{suggestion}</span>
              <span className="text-muted-foreground text-[0.5rem]">Tab</span>
              </button>
          </div>
        )}
      </div>
    </div>
  );
} 