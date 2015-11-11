module SurfNPerf
  class << self
    def load!
      if rails?
        register_rails_engine
      end
      if middleman?
        regsister_middleman_extension
      end
    end

    def rails?
      defined?(::Rails)
    end

    def middleman?
      defined?(::Middleman)
    end

    private

    def register_rails_engine
      require 'surfnperf/rails'
    end

    def regsister_middleman_extension
      require 'middleman_extension'
      ::Middleman::Extensions.register(:surfnperf) do 
        require "surfnperf/extension"
        ::Middleman::SurfNPerf
      end
    end
  end
end

SurfNPerf.load!