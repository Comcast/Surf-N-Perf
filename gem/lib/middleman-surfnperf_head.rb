# Require core library
require 'middleman-core'

::Middleman::Extensions.register(:surfnperf_head) do
  require "middleman-surfnperf_head/extension"
  ::Middleman::MyExtension
end
