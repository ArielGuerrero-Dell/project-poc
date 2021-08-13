set developer=%1
echo Running PKS Server Logs For Developer: %developer%

cd .\pks
kubectl describe deployment api-naming-intern-project-%developer%
kubectl describe service api-naming-intern-project-service-%developer%

kubectl get pod -l app=api-naming-intern-project-%developer% -o jsonpath="{.items..metadata.name}" > currentPod.txt
set /p podName=<currentPod.txt
del currentPod.txt
echo %podName%

kubectl exec -i -t -n parri-development %podName% -c api-naming-intern-project-%developer% "--" sh -c "clear; (bash || ash || sh)"
