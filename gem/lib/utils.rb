module SurfNPerf
  module Utils
    # Return a directory with the project libraries.
    def self.gem_libdir
      File.dirname(File.expand_path(__FILE__))
    end
  end
end