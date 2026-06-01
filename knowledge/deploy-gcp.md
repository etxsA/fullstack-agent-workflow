# Deploy — Google Cloud (Quarkus backend)

Pipeline: **Cloud Build → Artifact Registry → Cloud Run**, with **Secret Manager** for credentials and (optional) **Cloud SQL** for MySQL. Source HTML walkthrough: `_context-docs/backend-deploy-gcp.html`.

## Prereqs (once)
- GCP project with **billing** enabled. Pick a globally-unique `PROJECT_ID`.
- Enable APIs:
```bash
gcloud config set project $PROJECT_ID
gcloud services enable artifactregistry.googleapis.com cloudbuild.googleapis.com \
  run.googleapis.com secretmanager.googleapis.com sqladmin.googleapis.com
```
- Create the Docker repo:
```bash
gcloud artifacts repositories create $REPOSITORY \
  --repository-format=docker --location=$REGION
```

## Build + push (Cloud Build)
`cloudbuild.yaml` at repo root: `./mvnw -B -DskipTests package` → multi-stage Docker (`eclipse-temurin:21-jre`) → push to Artifact Registry with tags `:SHORT_SHA` + `:latest`. Tag precedence: `TAG_NAME → SHORT_SHA → dev`.
```bash
# local submit (no GitHub connection):
gcloud builds submit --config=cloudbuild.yaml \
  --substitutions=_REGION=$REGION,_REPOSITORY=$REPOSITORY,_IMAGE=$IMAGE .
# or a trigger on push to ^main$ (give Cloud Build SA roles/artifactregistry.writer)
```

## Secrets (never in repo/image)
```bash
gcloud secrets create firebase-service-account \
  --data-file=./firebase-adminsdk.json --replication-policy=automatic
# (and a db-password secret)
```

## Deploy to Cloud Run
```bash
gcloud run deploy $SERVICE \
  --image=$REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY/$IMAGE:latest \
  --region=$REGION --platform=managed --allow-unauthenticated --port=8080 \
  --set-env-vars=DB_KIND=mysql,DB_SCHEMA_STRATEGY=update,FIREBASE_SERVICE_ACCOUNT_LOCATION=/secrets/firebase.json \
  --set-env-vars=DB_JDBC_URL='jdbc:mysql:///<db>?cloudSqlInstance=<proj:region:inst>&socketFactory=com.google.cloud.sql.mysql.SocketFactory' \
  --set-secrets=DB_PASSWORD=db-password:latest \
  --set-secrets=/secrets/firebase.json=firebase-service-account:latest
```
- Firebase JSON is **mounted as a volume** at `/secrets/firebase.json`; the app reads `FIREBASE_SERVICE_ACCOUNT_LOCATION`.
- If using Cloud SQL, add the instance under Connections (or the socketFactory URL above).

## Verify / teardown
```bash
SERVICE_URL=$(gcloud run services describe $SERVICE --region=$REGION --format='value(status.url)')
curl $SERVICE_URL/status
# teardown to avoid charges:
gcloud run services delete $SERVICE --region=$REGION --quiet
gcloud artifacts repositories delete $REPOSITORY --location=$REGION --quiet
```

## Dockerfile (reference)
```dockerfile
FROM eclipse-temurin:21-jre
WORKDIR /deployments
COPY target/quarkus-app/lib/      lib/
COPY target/quarkus-app/*.jar     ./
COPY target/quarkus-app/app/      app/
COPY target/quarkus-app/quarkus/  quarkus/
EXPOSE 8080
ENTRYPOINT ["java","-Dquarkus.http.host=0.0.0.0","-jar","quarkus-run.jar"]
```
