Contribution Guidelines
=======================

We love to see contributions to the project and have tried to make it easy to do so. If you would like to contribute code to this project you can do so through GitHub by forking the repository and sending a pull request.

Before Comcast merges your code into the project you must sign the Comcast Contributor License Agreement (CLA).

If you haven’t previously signed a Comcast CLA, we can e-mail you a PDF that you can sign and scan back to us.  Please send us an e-mail or create a new GitHub issue to request a PDF version of the CLA.

For more details about contributing to GitHub projects see
http://gun.io/blog/how-to-github-fork-branch-and-pull-request/

Documentation
-------------

If you contribute anything that changes the behavior of the
application, document it in the [README](https://github.com/Comcast/Surf-N-Perf/blob/master/README.md) or [wiki](https://github.com/Comcast/Surf-N-Perf/wiki)! This includes new features, additional variants of behavior and breaking changes.

Testing
-------

Tests are written in [Jasmine](http://jasmine.github.io/), run with [Karma](http://karma-runner.github.io/), and instrumented by [Istanbul](https://github.com/yahoo/istanbul) via [karma-coverage](https://github.com/karma-runner/karma-coverage).

For a pull request that touches surfnperf.js to be accepted, it must be fully tested. If you're having trouble writing the tests, feel free to send your pull request and mention you need help testing it.

Pull Requests
-------------

* should be from a forked project with an appropriate branch name
* should be narrowly focused with no more than 3 or 4 logical commits
* when possible, address no more than one issue
* should be reviewable in the GitHub code review tool
* should be linked to any issues it relates to (i.e. issue number after
(#) in commit messages or pull request message)
* ```$ grunt precommit``` should be executed before committing

Expect a thorough review process for any pull requests that add functionality or change the behavior of the application. We encourage you to sketch your
approach in writing on a relevant issue (or creating such an issue if needed)
before starting to code, in order to save time and frustration all around.

Formatting
----------

The rules are simple: use the same formatting as the rest of the code.
The following is a list of the styles we are strict about:

* 2 space indent, no tabs
