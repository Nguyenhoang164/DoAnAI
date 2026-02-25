import cv2
import pickle
import numpy as np
from face_encoder import FaceEncoder

THRESHOLD = 0.8

encoder = FaceEncoder()

with open("face_db.pkl", "rb") as f:
    stored_embedding = pickle.load(f)

cap = cv2.VideoCapture(0)

print("Tìm kiếm khuôn mặt...")

while True:
    ret, frame = cap.read()

    emb = encoder.get_embedding(frame)

    if emb is not None:
        dist = np.linalg.norm(stored_embedding - emb)

        if dist < THRESHOLD:
            print("Mở khóa!")
            break

    cv2.imshow("Auth", frame)

    if cv2.waitKey(1) == 27:
        break

cap.release()
cv2.destroyAllWindows()