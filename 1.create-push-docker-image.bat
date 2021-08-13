set developer=%1
echo Building Docker Image for the Developer: %developer%

docker build -t %developer%/api-naming-intern-project .
docker login harbor.dell.com
docker tag %developer%/api-naming-intern-project harbor.dell.com/cloudenablement/api-naming-intern-project-%developer%:latest
docker push harbor.dell.com/cloudenablement/api-naming-intern-project-%developer%:latest

cd .\pks\%developer%

kubectl config use-context cloudenable01-r1-pks

kubectl delete deployment api-naming-intern-project-%developer%
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml

kubectl describe deployment api-naming-intern-project-%developer%
kubectl describe service api-naming-intern-project-service-%developer%
