# Campus Help Desk — interactive HTTP demo

A browser console backed by a real Express API. Choose a scenario, predict a status, and send the request. Demonstrates 200, 201, 204, 400, 404, and a deliberate 500.

[Deploy to Render](https://render.com/deploy?repo=https://github.com/rithakith/campus-help-desk-demo)

The Blueprint selects the free web service plan. Review the configuration in your Render account and deploy. The site root redirects to /classroom/. Free services may sleep after inactivity; open the site before class.

## Local use

```bash
npm ci
npm start
```

Open http://localhost:3000/classroom/. Run npm test for the API checks.

Data is temporary and shared across visitors. The reset button restores the initial records for everyone. Restarting the service resets the data. Use fictional examples only. The reset and error routes are teaching controls.

Student starter and exercises: https://github.com/rithakith/campus-help-desk

This deployment repository contains the demo interface and API, with no private teaching guides or slides.
