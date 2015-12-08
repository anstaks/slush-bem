/*
 * slush-bem
 * https://github.com/Anton Borzenko/slush-bem
 *
 * Copyright (c) 2015, anstak
 * Licensed under the MIT license.
 */

// http://thejackalofjavascript.com/building-slush-generator/

'use strict';

var gulp = require('gulp'),
    install = require('gulp-install'),
    conflict = require('gulp-conflict'),
    template = require('gulp-template'),
    rename = require('gulp-rename'),
    _ = require('underscore.string'),
    inquirer = require('inquirer'),
    path = require('path'),
    insert = require('gulp-insert');

function format(string) {
    var username = string.toLowerCase();
    return username.replace(/\s/g, '');
}

var defaults = (function () {
    var workingDirName = path.basename(process.cwd()),
      homeDir, osUserName, configFile, user;

    if (process.platform === 'win32') {
        homeDir = process.env.USERPROFILE;
        osUserName = process.env.USERNAME || path.basename(homeDir).toLowerCase();
    }
    else {
        homeDir = process.env.HOME || process.env.HOMEPATH;
        osUserName = homeDir && homeDir.split('/').pop() || 'root';
    }

    configFile = path.join(homeDir, '.gitconfig');
    user = {};

    if (require('fs').existsSync(configFile)) {
        user = require('iniparser').parseSync(configFile).user;
    }

    return {
        appName: workingDirName,
        userName: osUserName || format(user.name || ''),
        authorName: user.name || '',
        authorEmail: user.email || ''
    };
})();

gulp.task('default', function (done) {
    var prompts = [
      {
        type: 'list',
        name: 'element',
        message: 'Choose your element type:',
        choices: ['block', 'page'],
        default: 'block'
      }
    ];
    //Ask
    inquirer.prompt(prompts,
      function (answers) {
        run_gulp(answers.element);
      }
    );
});

function run_gulp(param) {
  if (param == "block") 
  {
    var prompts = [
      {
        name: 'blockName',
        message: 'Enter block name:',
      }, 
      {
        type: 'confirm',
        name: 'addToCss',
        message: 'Add css file to main.css?'
      }, 
      {
        type: 'confirm',
        name: 'addToJs',
        message: 'Add javascript file to main.js?'
      }
    ];
    //Ask
    inquirer.prompt(prompts,
      function (answers) {
        gulp.src(__dirname + '/templates/block/*')
          .pipe(template(answers))
          .pipe(rename(function (file) {
            file.basename = answers.blockName
          }))
          .pipe(conflict('./src/blocks/'+answers.blockName))
          .pipe(gulp.dest('./src/blocks/'+answers.blockName));
        if (answers.addToCss) {
          gulp.src('./src/style/main.css')
            .pipe(insert.append('\n@import "../blocks/'+answers.blockName+'/'+answers.blockName+'";'))
            .pipe(gulp.dest('./src/style/'));
        }
        if (answers.addToJs) {
          gulp.src('./src/js/main.js')
            .pipe(insert.append('\n//= ../blocks/'+answers.blockName+'/'+answers.blockName+'.js'))
            .pipe(gulp.dest('./src/js/'));
        }
      }
    );
  } 
  else if (param == "page") 
  {
    var prompts = [
      {
        name: 'pageName',
        message: 'Enter page name:',
      }
    ];
    //Ask
    inquirer.prompt(prompts,
      function (answers) {
          //answers.appNameSlug = _.slugify(answers.appName);
          gulp.src(__dirname + '/templates/**')
              .pipe(template(answers))
              .pipe(rename(function (file) {
                  if (file.basename[0] === '_') {
                      file.basename = '.' + file.basename.slice(1);
                  }
              }))
              .pipe(conflict('./'))
              .pipe(gulp.dest('./'))
              .pipe(install())
              .on('end', function () {
                  done();
              });
      }
    );
  }

}
