import { useState, ChangeEvent, useEffect } from 'react';
import { Camera, Loader2, Trash2, Plus, Utensils, Clock, Signal, Bookmark, User, Home, BookOpen, X } from 'lucide-react';
import './App.css';

interface Recipe {
  id?: string;
  title: string;
  description: string;
  time: string;
  difficulty: string;
  ingredients: string[];
  steps: string[];
}

interface Profile {
  name: string;
  allergies: string[];
  theme: string;
}

function App() {
  // --- States ---
  const [currentTab, setCurrentTab] = useState<'home' | 'myRecipes' | 'profile'>('home');
  const [image, setImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState('');
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  
  // --- Profile & Saved Recipes (Local Storage) ---
  const [profile, setProfile] = useState<Profile>(() => {
    const saved = localStorage.getItem('fridge_profile');
    return saved ? JSON.parse(saved) : { name: '사용자', allergies: [], theme: '간단 요리' };
  });

  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>(() => {
    const saved = localStorage.getItem('fridge_saved_recipes');
    return saved ? JSON.parse(saved) : [];
  });

  const [newAllergy, setNewAllergy] = useState('');

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem('fridge_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('fridge_saved_recipes', JSON.stringify(savedRecipes));
  }, [savedRecipes]);

  // --- Handlers ---
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => setImage(e.target?.result as string);
      reader.readAsDataURL(selectedFile);
      setIngredients([]);
      setRecipe(null);
    }
  };

  const analyzeImage = async () => {
    if (!file) return;
    setLoading(true);
    setRecipe(null);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Analysis failed');
      const data = await response.json();
      setIngredients(data.ingredients);
    } catch (error) {
      alert('이미지 분석에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getRecipe = async () => {
    if (ingredients.length === 0) return;
    setRecipeLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ingredients, 
          theme: profile.theme,
          exclude_ingredients: profile.allergies 
        }),
      });
      if (!response.ok) throw new Error('Failed');
      const data = await response.json();
      setRecipe(data);
    } catch (error) {
      alert('레시피 생성에 실패했습니다.');
    } finally {
      setRecipeLoading(false);
    }
  };

  const saveRecipe = () => {
    if (!recipe) return;
    if (savedRecipes.some(r => r.title === recipe.title)) {
      alert('이미 저장된 레시피입니다.');
      return;
    }
    const recipeToSave = { ...recipe, id: Date.now().toString() };
    setSavedRecipes([recipeToSave, ...savedRecipes]);
    alert('레시피 북에 저장되었습니다!');
  };

  const deleteSavedRecipe = (id: string) => {
    setSavedRecipes(savedRecipes.filter(r => r.id !== id));
  };

  const addAllergy = () => {
    if (newAllergy.trim() && !profile.allergies.includes(newAllergy.trim())) {
      setProfile({ ...profile, allergies: [...profile.allergies, newAllergy.trim()] });
      setNewAllergy('');
    }
  };

  const removeAllergy = (val: string) => {
    setProfile({ ...profile, allergies: profile.allergies.filter(a => a !== val) });
  };

  // --- Render Helpers ---
  const RecipeView = ({ item, onSave, isSaved }: { item: Recipe, onSave?: () => void, isSaved?: boolean }) => (
    <section className="recipe-card">
      <div className="recipe-header">
        <div className="recipe-header-top">
          <span className="recipe-tag">추천 요리</span>
          {onSave && (
            <button onClick={onSave} className="save-btn" title="저장하기">
              <Bookmark size={24} fill={isSaved ? "white" : "none"} />
            </button>
          )}
        </div>
        <h2>{item.title}</h2>
        <p className="description">{item.description}</p>
        <div className="recipe-meta">
          <span><Clock size={16} /> {item.time}</span>
          <span><Signal size={16} /> 난이도: {item.difficulty}</span>
        </div>
      </div>
      <div className="recipe-content">
        <div className="needed-ingredients">
          <h3><Utensils size={18} /> 필요 재료</h3>
          <ul>{item.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}</ul>
        </div>
        <div className="cooking-steps">
          <h3>조리 순서</h3>
          <ol>{item.steps.map((step, i) => <li key={i}><span className="step-num">{i + 1}</span><p>{step}</p></li>)}</ol>
        </div>
      </div>
    </section>
  );

  return (
    <div className="container">
      <nav className="bottom-nav">
        <button className={currentTab === 'home' ? 'active' : ''} onClick={() => setCurrentTab('home')}>
          <Home size={24} /><br/>홈
        </button>
        <button className={currentTab === 'myRecipes' ? 'active' : ''} onClick={() => setCurrentTab('myRecipes')}>
          <BookOpen size={24} /><br/>레시피 북
        </button>
        <button className={currentTab === 'profile' ? 'active' : ''} onClick={() => setCurrentTab('profile')}>
          <User size={24} /><br/>프로필
        </button>
      </nav>

      <header>
        <h1>냉장고 요리사 🥬</h1>
      </header>

      {currentTab === 'home' && (
        <main>
          <div className="left-panel">
            <section className="upload-section">
              <div className="image-preview-container">
                {image ? <img src={image} className="image-preview" /> : <div className="placeholder"><Camera size={48} /><p>사진 업로드</p></div>}
              </div>
              <input type="file" accept="image/*" id="image-upload" onChange={handleImageChange} hidden />
              <label htmlFor="image-upload" className="button upload-button">이미지 선택</label>
              <button onClick={analyzeImage} disabled={!file || loading} className="button analyze-button">
                {loading ? <Loader2 className="spinner" /> : '재료 분석'}
              </button>
            </section>

            {ingredients.length > 0 && (
              <section className="ingredients-section">
                <h2>인식된 재료</h2>
                <ul className="ingredient-list">
                  {ingredients.map((item, index) => (
                    <li key={index} className="ingredient-item">
                      <span>{item}</span>
                      <button onClick={() => setIngredients(ingredients.filter((_, i) => i !== index))} className="delete-button"><Trash2 size={16} /></button>
                    </li>
                  ))}
                  <li className="ingredient-item add-item">
                    <input value={newIngredient} onChange={(e) => setNewIngredient(e.target.value)} placeholder="재료 추가..." onKeyPress={(e) => e.key === 'Enter' && (setIngredients([...ingredients, newIngredient]), setNewIngredient(''))} />
                    <button onClick={() => (setIngredients([...ingredients, newIngredient]), setNewIngredient(''))} className="add-button"><Plus size={16} /></button>
                  </li>
                </ul>
                <div className="theme-selector">
                  <h3>테마: {profile.theme}</h3>
                </div>
                <button onClick={getRecipe} disabled={recipeLoading} className="button recipe-button">
                  {recipeLoading ? <Loader2 className="spinner" /> : 'AI 레시피 추천'}
                </button>
              </section>
            )}
          </div>
          <div className="right-panel">
            {recipe ? <RecipeView item={recipe} onSave={saveRecipe} isSaved={savedRecipes.some(r => r.title === recipe.title)} /> : (
              <div className="recipe-placeholder">
                {recipeLoading ? <Loader2 className="spinner" size={48} /> : <Utensils size={48} />}
                <p>{recipeLoading ? '레시피를 생성 중...' : '재료를 분석한 후 레시피를 받아보세요!'}</p>
              </div>
            )}
          </div>
        </main>
      )}

      {currentTab === 'myRecipes' && (
        <main className="full-width">
          <section className="my-recipes-section">
            <h2>나의 레시피 북 ({savedRecipes.length})</h2>
            {savedRecipes.length === 0 ? <p className="empty-msg">아직 저장된 레시피가 없습니다.</p> : (
              <div className="recipe-grid">
                {savedRecipes.map(r => (
                  <div key={r.id} className="mini-recipe-card">
                    <button className="delete-saved-btn" onClick={() => r.id && deleteSavedRecipe(r.id)}><X size={16} /></button>
                    <h3>{r.title}</h3>
                    <p>{r.description}</p>
                    <button className="view-btn" onClick={() => setRecipe(r) || setCurrentTab('home')}>보기</button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      )}

      {currentTab === 'profile' && (
        <main className="full-width">
          <section className="profile-section">
            <h2>사용자 프로필</h2>
            <div className="profile-item">
              <label>이름</label>
              <input value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} />
            </div>
            <div className="profile-item">
              <label>선호 테마</label>
              <select value={profile.theme} onChange={(e) => setProfile({...profile, theme: e.target.value})}>
                {['간단 요리', '든든한 한 끼', '술안주', '다이어트식'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="profile-item">
              <label>못 먹는 재료 (알레르기/취향)</label>
              <div className="allergy-tags">
                {profile.allergies.map(a => (
                  <span key={a} className="tag">{a} <button onClick={() => removeAllergy(a)}><X size={12} /></button></span>
                ))}
              </div>
              <div className="add-allergy">
                <input value={newAllergy} onChange={(e) => setNewAllergy(e.target.value)} placeholder="예: 오이, 견과류" onKeyPress={(e) => e.key === 'Enter' && addAllergy()} />
                <button onClick={addAllergy}>추가</button>
              </div>
            </div>
            <p className="profile-hint">등록된 '못 먹는 재료'는 AI 레시피 생성 시 자동으로 제외됩니다.</p>
          </section>
        </main>
      )}
    </div>
  );
}

export default App;
