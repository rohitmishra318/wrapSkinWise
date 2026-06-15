import cv2
import numpy as np

class Colorimetry:
    def analyze(self, img_bgr, skin_mask):
        lab = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        
        l_mean = np.mean(l[skin_mask > 0])
        a_mean = np.mean(a[skin_mask > 0])
        b_mean = np.mean(b[skin_mask > 0])
        
        l_norm = l_mean * (100.0 / 255.0)
        b_norm = b_mean - 128
        
        ita_angle = np.degrees(np.arctan((l_norm - 50) / b_norm)) if b_norm != 0 else 0
        
        if ita_angle > 55: fitz = 1
        elif ita_angle > 41: fitz = 2
        elif ita_angle > 28: fitz = 3
        elif ita_angle > 10: fitz = 4
        elif ita_angle > -30: fitz = 5
        else: fitz = 6
        
        return fitz, ita_angle, {"l": float(l_mean), "a": float(a_mean), "b": float(b_mean)}
