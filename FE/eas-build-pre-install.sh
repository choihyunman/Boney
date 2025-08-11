#!/bin/bash
echo $GOOGLE_SERVICES_JSON | base64 --decode > ./android/app/google-services.json