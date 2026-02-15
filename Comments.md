# Comments

- I have added TODO comments within the code, especially the file `getPackageDependencies.ts`
- issue (blocking): Great to see the `getPackage.integration.test.ts` was updated but nothing 
added or changed in `getPackageDependencies.test.ts`, these existing tests are now failing 
and require updating.

# Confirming changes
- It looks like the intended changes do work
Main
curl http://localhost:3000/package/react/16.13.0 | jq .
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   122  100   122    0     0    292      0 --:--:-- --:--:-- --:--:--   292
{
  "name": "react",
  "version": "16.13.0",
  "dependencies": {
    "prop-types": "15.8.1",
    "loose-envify": "1.4.0",
    "object-assign": "4.1.1"
  }
}

feat/resolve-dependency-tree
curl http://localhost:3000/package/react/16.13.0 | jq .
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   467  100   467    0     0    602      0 --:--:-- --:--:-- --:--:--   601
{
  "name": "react",
  "version": "16.13.0",
  "dependencies": {
    "prop-types": {
      "version": "15.8.1",
      "dependencies": {
        "loose-envify": {
          "version": "1.4.0",
          "dependencies": {
            "js-tokens": {
              "version": "4.0.0",
              "dependencies": {}
            }
          }
        },
        "object-assign": {
          "version": "4.1.1",
          "dependencies": {}
        },
        "react-is": {
          "version": "16.13.1",
          "dependencies": {}
        }
      }
    },
    "loose-envify": {
      "version": "1.4.0",
      "dependencies": {
        "js-tokens": {
          "version": "4.0.0",
          "dependencies": {}
        }
      }
    },
    "object-assign": {
      "version": "4.1.1",
      "dependencies": {}
    }
  }
}


# e2e test
Running e2e test on main:
Jest has detected the following 1 open handle potentially keeping Jest from exiting:

●  STREAM_END_OF_STREAM
const server = app.listen(port, () => {

Running npm install;
11 vulnerabilities (4 low, 2 moderate, 4 high, 1 critical)

suggestion/follow-up: look at cleaning up the e2e test with the handle not exiting cleanly
suggestion/follow-up: Look at solving the critical/high vulnerabilities
