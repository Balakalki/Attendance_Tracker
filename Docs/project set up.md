# Back end set up with node.js + express + docker

1. Created Docker file with name Dockerfile.
2. add "public.ecr.aws/lambda/nodejs:22" as a base image to the Dockerfile.
3. create image using docker command `docker build -t attendance_tracker`.
3. created container and connected it to local storage using docker volumes with the attendance_tracker image 
4. open vs code in the project folder and run this command `docker run --name attendance_tracker_container -v "$(pwd)":/var/task -p 3000:3000 attendane_tracker` to complete step 3.
5. open the container shell in vs code using command `docker exec -it attendance_tracker_container sh`
6. now initialized node project inside the container using npm command`npm init` and install express by running `npm install express`.



# Front end set up with React.js + Tailwindcss

1. create react app using vite with the command `npm create vite@latest`.
2. install tailwindcss and @tailwindcss/vite as devdependencies.
3. add @tailwindcss/vite as a plugin in the vite.config.js file.
4. add `@import "tailwindcss";` to the index.css file.