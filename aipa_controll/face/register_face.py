import cv2
import pickle
from face_encoder import FaceEncoder

encoder = FaceEncoder()

cap = cv2.VideoCapture(0)

print("Nhấn SPACE để lấy khôn mặt")

while True:
    ret, frame = cap.read()

    cv2.imshow("Đăng ký khuôn mặt", frame)

    key = cv2.waitKey(1)

    if key == 32:  # SPACE
        emb = encoder.get_embedding(frame)

        if emb is not None:
            with open("face_db.pkl", "wb") as f:
                pickle.dump(emb, f)

            print("Đăng ký khuôn mặt thành công!")
            break
        else:
            print("Không tìm thấy")

    if key == 27:
        break

cap.release()
cv2.destroyAllWindows()