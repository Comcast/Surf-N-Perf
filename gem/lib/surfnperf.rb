module SurfNPerf
  class << self
    def load!
      if rails?
        register_rails_engine
      end
    end

    def rails?
      defined?(::Rails)
    end

    private

    def register_rails_engine
      require 'surfnperf/rails'
    end
  end
end

SurfNPerf.load!