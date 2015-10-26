# coding: utf-8
lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)

require 'json'
pkg_json = JSON.load File.new("../package.json")

Gem::Specification.new do |spec|
  spec.name          = pkg_json["name"]
  spec.version       = pkg_json["version"]
  spec.authors       = ["John Riviello"]
  spec.email         = ["john_riviello@comcast.com"]
  spec.summary       = pkg_json["description"]
  spec.description   = pkg_json["description"]
  spec.homepage      = pkg_json["homepage"]
  spec.license       = pkg_json["license"]

  spec.files         = Dir["{app,lib,vendor}/**/*"] + ["README.md"]
  spec.require_paths = ["lib"]

  spec.add_development_dependency "bundler", "~> 1.5"
  spec.add_development_dependency "rake"
  spec.add_runtime_dependency("middleman-core", [">= 3.4.0"])
end
