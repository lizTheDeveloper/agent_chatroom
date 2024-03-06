
1. Make sure you have gcloud
2. Create a static IP: `gcloud compute addresses create my-static-ip --region us-west1`
3. Make a compute engine instance

```bash
gcloud compute instance-templates create websocket-template \
    --machine-type=g1-small \
    --image-family=debian-10 \
    --image-project=debian-cloud \
    --tags=websocket-server \
    --metadata=startup-script='#! /bin/bash
      sudo apt-get update
      sudo apt-get install -y nodejs npm
      sudo apt-get install -y git-all
      sudo git clone https://github.com/lizTheDeveloper/agent_chatroom.git /opt/websocket-chat
      cd /opt/websocket-chat
      npm install
      nohup node index.js > server.log 2>&1 &'

```

4. Create an instance from the template

```bash
gcloud compute instances create websocket-instance \
    --zone=us-west1-a \
    --source-instance-template=websocket-template \
    --address=my-static-ip

```

5. Set up firewall rules
```bash
gcloud compute firewall-rules create websocket-server-rule --allow tcp:3535 --target-tags=websocket-server
gcloud compute firewall-rules create http-server-rule --allow tcp:80 --target-tags=websocket-server
```

6. Set up cloud build?

```bash
steps:
  - name: 'gcr.io/cloud-builders/gcloud'
    args: ['compute', 'instances', 'create', 'websocket-instance-new', '--zone=us-west1-a', '--source-instance-template=websocket-template', '--address=my-static-ip']
  - name: 'gcr.io/cloud-builders/gcloud'
    args: ['compute', 'instances', 'delete', 'websocket-instance', '--zone=us-west1-a']


```


## Log into the server

gcloud compute ssh --zone "us-west1-a" "websocket-instance" --project "technomancyschool-394117"