BIN := ./node_modules/.bin
SPEC := spec/helper.js $(shell find spec/lib -type f -name "*.js")
VERSION := $(shell node -e "console.log(require('./package.json').version)")

default: lint test

minified:
	@$(BIN)/browserify --standalone Threepio index.js | \
	$(BIN)/uglifyjs --compress --mangle - 2>/dev/null > \
	./dist/cppp-io.js

test:
	@$(BIN)/mocha --colors -R dot $(SPEC)

bdd:
	@$(BIN)/mocha --colors -R spec $(SPEC)

cover:
	@istanbul cover $(BIN)/_mocha $(SPEC) --report lcovonly -- -R spec

lint:
	@$(bin)eslint lib spec

ci: lint cover

release: lint test
	@git push origin master
	@git checkout release ; git merge master ; git push ; git checkout master
	@git tag -m "$(VERSION)" v$(VERSION)
	@git push --tags
	@npm publish ./

.PHONY: default cover test bdd lint ci release
