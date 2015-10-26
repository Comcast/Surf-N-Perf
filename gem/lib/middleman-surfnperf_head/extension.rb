# Require core library
require 'middleman-core'
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
    # end

    helpers do
      def surfnperf_head
        render inline: '../../app/views/surfnperf/_head'
      end
    end
  end
end
