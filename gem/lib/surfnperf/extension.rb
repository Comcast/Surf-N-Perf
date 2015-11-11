require_relative '../utils'
# Extension namespace
module Middleman
  class SurfNPerf < Extension

    helpers do
      def surfnperf_head
        filePath = File.join(::SurfNPerf::Utils.gem_libdir,'../app/views/surfnperf/_head.html.erb')
        f = File.open(filePath, 'r')
        f.read()
      end
    end
  end
end
