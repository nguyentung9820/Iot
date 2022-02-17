# import the necessary packages
from urllib import response
import face_recognition
from imutils.video import VideoStream
from flask import Response
from flask import Flask
from flask import render_template
import threading
import argparse
import imutils
import time
import cv2
import os
import numpy as np
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
import datetime
import requests

outputFrame = None
lock = threading.Lock()
app = Flask(__name__)
vs = VideoStream(src=-1).start()

#vs = VideoStream(src="http://192.168.1.4:81/stream").start()
time.sleep(2.0)

@app.route("/")
def index():
	return render_template("index.html")
cascPath=os.path.dirname(cv2.__file__)+"/data/haarcascade_frontalface_default.xml"
faceCascade = cv2.CascadeClassifier(cascPath)
def detect_motion(frameCount):
    try:
        global vs, outputFrame, lock, responses
        # # Create arrays of known face encodings and their names
        known_face_encodings = []
        known_face_names = []
        known_face_ids = []
        # Initialize some variables
        face_locations = []
        face_encodings = []
        face_names = []
        process_this_frame = True
        uri = 'mongodb://127.0.0.1:27017/iot'
        connect = MongoClient(uri)
        print("MongoDB cluster is reachable")
        print(connect)
        cursor = connect.iot.members.find({})
        for element in cursor:
            member_id = element["_id"]
            image_name = element["avatar"]
            image = face_recognition.load_image_file("src/public/image/" + image_name)
            face_encoding = face_recognition.face_encodings(image)[0]
            known_face_encodings.append(face_encoding)
            known_face_names.append(element["username"])
            known_face_ids.append(member_id)
        # loop over frames from the video stream
        
        while True:
            frame = vs.read()
            frame = imutils.resize(frame, width=400, height=400)
            timestamp = datetime.datetime.now()
            cv2.putText(frame, timestamp.strftime(
			    "%A %d %B %Y %I:%M:%S%p"), (10, frame.shape[0] - 10),
			    cv2.FONT_HERSHEY_SIMPLEX, 0.35, (0, 0, 255), 1)         
            rgb_small_frame = frame[:, :, ::-1]
            if process_this_frame:
                face_locations = face_recognition.face_locations(rgb_small_frame)
                face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)
                face_names = []
                for face_encoding in face_encodings:
                    # See if the face is a match for the known face(s)
                    matches = face_recognition.compare_faces(known_face_encodings, face_encoding)
                    name = "Unknown"

                    # If a match was found in known_face_encodings, just use the first one.
                    # if True in matches:
                    #     first_match_index = matches.index(True)
                    #     name = known_face_names[first_match_index]

                    # Or instead, use the known face with the smallest distance to the new face
                    face_distances = face_recognition.face_distance(known_face_encodings, face_encoding)
                    best_match_index = np.argmin(face_distances)
                    if matches[best_match_index]:
                        name = known_face_names[best_match_index]
                        id = known_face_ids[best_match_index]
                        web_url = 'http://localhost:9220/customer/' + str(id)
                        responses = requests.post(web_url)
                        


                    face_names.append(name)
            process_this_frame = not process_this_frame
            for (top, right, bottom, left), name in zip(face_locations, face_names):
                # Scale back up face locations since the frame we detected in was scaled to 1/4 size
                top *= 1
                right *= 1
                bottom *= 1
                left *= 1
                # checkin_img = cv2.imread("checkin.png")
                # size = 50
                # checkin_img = cv2.resize(checkin_img, (size, size))
                # frame[1, 2, 1] = checkin_img
                # Draw a box around the face
                cv2.rectangle(frame, (left, top-20), (right, bottom), (0, 0, 255), 1)
                # Draw a label with a name below the face
                cv2.rectangle(frame, (left, bottom + 25), (right, bottom), (0, 0, 255), cv2.FILLED)
                font = cv2.FONT_HERSHEY_DUPLEX
                cv2.putText(frame, name, (left + 3, bottom+23), font, 1.0, (255, 255, 255), 1)
                if responses.status_code == 200:
                    cv2.putText(frame, 'Checked in', (left + 3, bottom+40), font, 0.5, (0, 255, 0), 1)
                
            with lock:
                outputFrame = frame.copy()
    except ConnectionFailure as e:
        print("Could not connect to MongoDB")
        print(e)
	

def generate():
	# grab global references to the output frame and lock variables
	global outputFrame, lock
	# loop over frames from the output stream
	while True:
		# wait until the lock is acquired
		with lock:
			# check if the output frame is available, otherwise skip
			# the iteration of the loop
			if outputFrame is None:
				continue
			# encode the frame in JPEG format
			(flag, encodedImage) = cv2.imencode(".jpg", outputFrame)
			# ensure the frame was successfully encoded
			if not flag:
				continue
		# yield the output frame in the byte format
		yield(b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + 
			bytearray(encodedImage) + b'\r\n')

@app.route("/video_feed")
def video_feed():
	# return the response generated along with the specific media
	# type (mime type)
	return Response(generate(),
		mimetype = "multipart/x-mixed-replace; boundary=frame")

# check to see if this is the main thread of execution
if __name__ == '__main__':
	# construct the argument parser and parse command line arguments
	ap = argparse.ArgumentParser()
	ap.add_argument("-i", "--ip", type=str, required=True,
		help="ip address of the device")
	ap.add_argument("-o", "--port", type=int, required=True,
		help="ephemeral port number of the server (1024 to 65535)")
	ap.add_argument("-f", "--frame-count", type=int, default=32,
		help="# of frames used to construct the background model")
	args = vars(ap.parse_args())
	# start a thread that will perform motion detection
	t = threading.Thread(target=detect_motion, args=(
		args["frame_count"],))
	t.daemon = True
	t.start()
	# start the flask app
	app.run(host=args["ip"], port=args["port"], debug=True,
		threaded=True, use_reloader=False)
# release the video stream pointer
vs.stop()
