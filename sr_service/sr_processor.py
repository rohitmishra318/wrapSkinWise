import numpy as np
import cv2
import os

class SRProcessor:
    def __init__(self):
        self.device = 'cuda'
        self.realesrgan = None
        self.gfpgan = None
        self._init_models()

    def _init_models(self):
        try:
            from basicsr.archs.rrdbnet_arch import RRDBNet
            from realesrgan import RealESRGANer
            from gfpgan import GFPGANer

            model_path_realesrgan = os.path.join('weights', 'RealESRGAN_x4plus.pth')
            if os.path.exists(model_path_realesrgan):
                model = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=23, num_grow_ch=32, scale=4)
                self.realesrgan = RealESRGANer(scale=4, model_path=model_path_realesrgan, model=model, tile=400, tile_pad=10, pre_pad=0, half=False)

            model_path_gfpgan = os.path.join('weights', 'GFPGANv1.4.pth')
            if os.path.exists(model_path_gfpgan):
                self.gfpgan = GFPGANer(model_path=model_path_gfpgan, upscale=4, arch='clean', channel_multiplier=2, bg_upsampler=self.realesrgan)
        except Exception as e:
            print(f"Failed to load SR models: {e}")

    def select_model(self, face_coverage_ratio: float) -> str:
        return 'GFPGAN' if face_coverage_ratio > 0.4 else 'RealESRGAN_x4plus'

    def enhance(self, img_bgr: np.ndarray, model_name: str) -> tuple[np.ndarray, str]:
        if model_name == 'GFPGAN' and self.gfpgan:
            _, _, output = self.gfpgan.enhance(img_bgr, has_aligned=False, only_center_face=False, paste_back=True)
            return output, model_name
        elif self.realesrgan:
            output, _ = self.realesrgan.enhance(img_bgr, outscale=4)
            return output, 'RealESRGAN_x4plus'
        else:
            return img_bgr, 'None'

    def post_process(self, enhanced: np.ndarray, target_size=(1280, 1280)) -> np.ndarray:
        h, w = enhanced.shape[:2]
        if max(h, w) > 1280:
            scale = 1280 / max(h, w)
            new_w = int(w * scale)
            new_h = int(h * scale)
            return cv2.resize(enhanced, (new_w, new_h), interpolation=cv2.INTER_AREA)
        return enhanced
