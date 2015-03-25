# coding: utf-8
lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)

require 'json'
pkg_json = JSON.load File.new("../package.json")

Gem::Specification.new do |spec|
  spec.name          = pkg_json["name"]
  spec.version       = pkg_json["version"]
  spec.authors       = ["John Riviello, Trevor Lalish-Menagh"]
  spec.email         = ["john_riviello@comcast.com"]
  spec.summary       = %q{Surf-N-Perf: Micro-library for gathering frontend web page performance data.}
  spec.description   = pkg_json["description"]
  spec.homepage      = "https://github.com/Comcast/Surf-N-Perf"
  spec.license       = "Apache License, Version 2.0"

  spec.files         = Dir["{lib,vendor}/**/*"] + ["README.md"] + ["./app/views/surfnperf/_surfnperf.html.erb"]
  spec.require_paths = ["lib"]

  spec.add_development_dependency "bundler", "~> 1.5"
  spec.add_development_dependency "rake"
end
