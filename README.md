S3 이미지 저장 구현 <br/>
Signed URL 방식으로 허용된 사용자만 접근 가능 <br/> <br/>
라우트 추가됨 --> s3Rouotes.js<br/>
해당 라우트에서 실제 이미지 접근에 필요한 signedURL 제공해줌


## 📸 S3 이미지 렌더링 방식 (Using Signed URL)

### 🧩 구조 개요

이미지 파일은 S3에 저장되고, DB에는 이미지 경로(key)만 저장합니다.
프론트는 해당 key를 이용해 백엔드로 signed URL을 요청한 뒤 이미지를 렌더링합니다.

---

### 🧱 저장 방식 (Database)

```json
{
  "profile_image": "profile-images/db52936b-fc78-4f7c-b09c-5244692294ac"
}
```

---

### 🚀 요청 흐름

```plaintext
[DB에 저장된 key]
        ↓
Frontend
  GET /s3/get-image-url?key=profile-images/xxx.jpg
        ↓
Backend
  → AWS S3 signed URL 생성 (유효기간 있음)
        ↓
Frontend
  → 받은 URL을 <img src="..."> 로 사용
```

---

### 🧑‍💻 프론트엔드 예시 (React)

```jsx
import { useEffect, useState } from "react";

function ProfileImage({ imageKey }) {
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    const fetchSignedUrl = async () => {
      const res = await fetch(`/s3/get-image-url?key=${encodeURIComponent(imageKey)}`);
      const data = await res.json();
      setImageUrl(data.url);
    };
    if (imageKey) fetchSignedUrl();
  }, [imageKey]);

  return imageUrl ? <img src={imageUrl} alt="프로필 이미지" /> : <p>로딩 중...</p>;
}
```

---

### 🛡️ 보안 및 장점

* **S3는 퍼블릭 접근 없이 안전하게 보호됨**
* **Signed URL은 유효기간이 있어 일시적 접근만 허용**
* **DB에는 경로만 저장하므로 구조가 가볍고 유연함**

---

