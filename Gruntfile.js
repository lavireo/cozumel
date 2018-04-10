module.exports = function(grunt)
{
  ///
  // Javascript definitions
  var js_out  = "public/static/js/";
  var js_libs = [
    'src/assets/js/libs/bundler.js',
    'src/assets/js/libs/bundler-*.js',
    'src/assets/js/third_party/**/*.js'
  ];

  var js_dependencies = {
    app: [
      'src/assets/js/configs/**/*.js',
      'src/assets/js/modules/shortcuts.js',
      'src/assets/js/modules/actions.js',
      'src/assets/js/modules/router.js',
      'src/assets/js/modules/cache.js',
      'src/assets/js/modules/money.js',
      'src/assets/js/modules/date.js',
      'src/assets/js/modules/u2f.js',

      'src/assets/js/modules/config.js',
      'src/assets/js/modules/stripe.js',
      'src/assets/js/modules/events.js',

      'src/assets/js/components/**/*.js',
      'src/assets/js/layouts/**/*.js',
      'src/assets/js/modals/**/*.js',
      'src/assets/js/cards/**/*.js',
      'src/assets/js/views/**/*.js',

      'src/assets/js/app.js'
    ]
  };

  var js_t;
  var js_files = {};
  for (js_t in js_dependencies)
  {
    js_files[js_out + js_t + '.js'] = js_libs.concat(js_dependencies[js_t]);
  }


  //
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    ///
    // Sass
    sass: {
      prod: {
        options: {
          style: 'compact',
          noCache: true,
          sourceMap: false,
          bundleExec: true
        },

        files: [{
          expand: true,
          cwd: 'src/assets/scss',
          src: ['*.scss'],
          dest: 'res',
          ext: '.css'
        }]
      }
    },

    ///
    // Watch
    watch: {
      js: {
        files: ['src/assets/js/**/*.js'],
        tasks: ['uglify']
      },

      img: {
        files: ['src/assets/img/**/*.png', 'src/assets/img/**/*.svg', 'src/assets/img/**/*.jpg'],
        tasks: ['imagemin:prod']
      },

      sass: {
        files: ['src/assets/scss/**/*.scss'],
        tasks: ['sass:prod']
      },

      configFiles: {
        files: ['Gruntfile.js'],
        options: {
          reload: true
        }
      }
    },

    ///
    // Uglify
    uglify: {
      options: {
        banner: '/*\n'
              + ' *\n'
              + ' * Un projet par Laviréo\n'
              + ' *\n'
              + ' * Author: Maurice T. Meyer\n'
              + ' * E-Mail: maurice@lavireo.com\n'
              + ' *\n'
              + ' * (c) Laviréo\n'
              + ' */\n\n\n'
      },
      all: {
        files: js_files
      }
    },

    ///
    // cssmin
    cssmin: {
      prod: {
        files: [{
          expand: true,
          src: ['*.css'],
          cwd: 'res/',
          dest: 'res/',
          ext: '.css'
        }]
      }
    },

    ///
    // Imagemin
    imagemin: {
      prod: {
        options: {
          optimizationLevel: 3
        },
        files: [{
           expand: true,
           cwd: 'src/assets/img/',
           src: ['**/*.{png,jpg,gif,svg}'],
           dest: 'res/'
        }]
      }
    },
  });

  //
  // Load the plugins
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  //
  // Default task(s).
  grunt.registerTask('dev',     ['uglify', 'sass:prod', 'imagemin:prod', 'watch']);
  grunt.registerTask('default', ['uglify', 'imagemin:prod', 'sass:prod', 'cssmin:prod']);
};
