# Require core library
require 'middleman-core'
require_relative '../utils'
# Extension namespace
module Middleman
  class MyExtension < Extension
    option :my_option, 'default', 'An example option'

    def initialize(app, options_hash={}, &block)
      # Call super to build options from the options_hash
      super

      # Require libraries only when activated
      # require 'necessary/library'

      # set up your extension
      # puts options.my_option
    end

    def after_configuration
      # Do something
    end

    # A Sitemap Manipulator
    # def manipulate_resource_list(resources)
    # end

    # module do
    #   def a_helper
    #   end
    # end/

    helpers do
      def surfnperf_head
        filePath = SurfNPerf::Utils.gem_libdir + '/middleman-surfnperf_head/_head.html.erb'
        f = File.open(filePath, 'r')
        f.read()
      end
    end

    ######### Here's possibly the worst, but still functioning idea...##########
    # helpers do
    #   def surfnperf_head
    #     "<script>
    #       var SURF_N_PERF = {
    #         marks: {},
    #         highResMarks: {}
    #       };

    #       SURF_N_PERF.marks.pageStart = (new Date()).getTime();

    #       if(window.performance) {
    #         if(window.performance.now) {
    #           SURF_N_PERF.highResMarks.pageStart = window.performance.now();
    #         }
    #         if(window.performance.mark) {
    #           window.performance.mark('pageStart');
    #         }
    #       }

    #       SURF_N_PERF.setPageLoad = function() {
    #         SURF_N_PERF.marks.loadEventEnd = (new Date()).getTime();

    #         if(window.performance && window.performance.now) {
    #           SURF_N_PERF.highResMarks.loadEventEnd = window.performance.now();
    #         }
    #       };

    #       if(window.addEventListener) {
    #         window.addEventListener('load', SURF_N_PERF.setPageLoad, false);
    #       } else {
    #         window.attachEvent('onload', SURF_N_PERF.setPageLoad);
    #       }
    #     </script>"
    #   end
    # end
  end
end
