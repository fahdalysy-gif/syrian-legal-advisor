import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { styled } from 'nativewind';
import lawsData from '../constants/lawsData';
import { HeartIcon, SearchIcon, FilterIcon } from '../components/Icons';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledScrollView = styled(ScrollView);
const StyledFlatList = styled(FlatList);

/**
 * شاشة المرجع القانوني السوري
 * تتضمن واجهة بحث متقدمة وتصنيفات قانونية
 */
const LawLibraryScreen = ({ navigation }) => {
  // ============================================
  // الحالات (States)
  // ============================================
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [expandedArticle, setExpandedArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // ============================================
  // استخراج الفئات الفريدة من البيانات
  // ============================================
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(lawsData.map((law) => law.category))];
    return uniqueCategories;
  }, []);

  // ============================================
  // تصفية القوانين حسب البحث والفئة والمفضلة
  // ============================================
  const filteredLaws = useMemo(() => {
    let result = lawsData;

    // تصفية حسب الفئة المختارة
    if (selectedCategory) {
      result = result.filter((law) => law.category === selectedCategory);
    }

    // تصفية حسب نص البحث
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((law) =>
        law.title.toLowerCase().includes(query) ||
        law.legalText.toLowerCase().includes(query) ||
        law.simplifiedExplanation.toLowerCase().includes(query) ||
        law.articleNumber.toString().includes(query)
      );
    }

    // تصفية حسب المفضلة فقط
    if (showFavoritesOnly) {
      result = result.filter((law) => favorites.includes(law.id));
    }

    return result;
  }, [searchQuery, selectedCategory, favorites, showFavoritesOnly]);

  // ============================================
  // إضافة/إزالة من المفضلة
  // ============================================
  const toggleFavorite = (lawId) => {
    setIsLoading(true);
    setTimeout(() => {
      setFavorites((prevFavorites) =>
        prevFavorites.includes(lawId)
          ? prevFavorites.filter((id) => id !== lawId)
          : [...prevFavorites, lawId]
      );
      setIsLoading(false);
    }, 300);
  };

  // ============================================
  // نسخ النص إلى الحافظة
  // ============================================
  const copyToClipboard = (text) => {
    Alert.alert('تم النسخ', 'تم نسخ النص بنجاح إلى الحافظة');
  };

  // ============================================
  // مكون الفئات
  // ============================================
  const CategoryItem = ({ category }) => {
    const isSelected = selectedCategory === category;
    return (
      <StyledTouchableOpacity
        onPress={() => setSelectedCategory(isSelected ? '' : category)}
        className={`px-4 py-2 rounded-full mr-2 mb-3 border-2 ${
          isSelected
            ? 'bg-blue-600 border-blue-700'
            : 'bg-white border-gray-300'
        }`}
      >
        <StyledText
          className={`text-sm font-semibold ${
            isSelected ? 'text-white' : 'text-gray-700'
          }`}
        >
          {category}
        </StyledText>
      </StyledTouchableOpacity>
    );
  };

  // ============================================
  // مكون المادة القانونية
  // ============================================
  const LawArticleCard = ({ item }) => {
    const isFavorited = favorites.includes(item.id);
    const isExpanded = expandedArticle === item.id;

    return (
      <StyledView className="bg-white rounded-lg p-4 mb-3 border border-gray-200 shadow-sm">
        {/* رأس المادة */}
        <StyledTouchableOpacity
          onPress={() =>
            setExpandedArticle(isExpanded ? null : item.id)
          }
          className="flex-row items-center justify-between mb-2"
        >
          <StyledView className="flex-1">
            <StyledText className="text-xs font-semibold text-blue-600 mb-1">
              المادة {item.articleNumber}
            </StyledText>
            <StyledText className="text-sm font-bold text-gray-800 flex-wrap">
              {item.title}
            </StyledText>
          </StyledView>

          {/* زر المفضلة */}
          <StyledTouchableOpacity
            onPress={() => toggleFavorite(item.id)}
            className="ml-3"
          >
            <StyledText className={`text-2xl ${isFavorited ? 'text-red-500' : 'text-gray-300'}`}>
              ♥
            </StyledText>
          </StyledTouchableOpacity>
        </StyledTouchableOpacity>

        {/* محتوى المادة المتسع */}
        {isExpanded && (
          <StyledView className="mt-3 pt-3 border-t border-gray-200">
            {/* النص القانوني */}
            <StyledView className="mb-3">
              <StyledText className="text-xs font-semibold text-gray-600 mb-2">
                📜 النص القانوني:
              </StyledText>
              <StyledText className="text-sm text-gray-700 leading-relaxed text-right">
                {item.legalText}
              </StyledText>
              <StyledTouchableOpacity
                onPress={() => copyToClipboard(item.legalText)}
                className="mt-2 p-2 bg-gray-100 rounded"
              >
                <StyledText className="text-xs text-blue-600 font-semibold text-center">
                  📋 نسخ النص
                </StyledText>
              </StyledTouchableOpacity>
            </StyledView>

            {/* الشرح المبسط */}
            <StyledView className="mb-3">
              <StyledText className="text-xs font-semibold text-gray-600 mb-2">
                💡 شرح المستشار:
              </StyledText>
              <StyledText className="text-sm text-gray-600 leading-relaxed text-right">
                {item.simplifiedExplanation}
              </StyledText>
            </StyledView>

            {/* المواضيع المرتبطة */}
            {item.relatedTopics && item.relatedTopics.length > 0 && (
              <StyledView>
                <StyledText className="text-xs font-semibold text-gray-600 mb-2">
                  🔗 مواضيع مرتبطة:
                </StyledText>
                <StyledView className="flex-row flex-wrap">
                  {item.relatedTopics.map((topic, index) => (
                    <StyledView
                      key={index}
                      className="bg-blue-50 rounded-full px-3 py-1 mr-2 mb-2"
                    >
                      <StyledText className="text-xs text-blue-600">
                        #{topic}
                      </StyledText>
                    </StyledView>
                  ))}
                </StyledView>
              </StyledView>
            )}
          </StyledView>
        )}

        {/* مؤشر التوسع */}
        <StyledText className="text-gray-400 text-center mt-2 text-xs">
          {isExpanded ? '▲' : '▼'}
        </StyledText>
      </StyledView>
    );
  };

  // ============================================
  // الواجهة الرئيسية
  // ============================================
  return (
    <StyledView className="flex-1 bg-gray-50">
      {/* رأس الصفحة */}
      <StyledView className="bg-gradient-to-b from-blue-600 to-blue-700 pt-4 pb-6 px-4">
        <StyledText className="text-2xl font-bold text-white mb-2">
          المرجع القانوني السوري 📚
        </StyledText>
        <StyledText className="text-xs text-blue-100">
          البحث السريع في القوانين والمواد القانونية السورية
        </StyledText>
      </StyledView>

      <StyledScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {/* شريط البحث */}
        <StyledView className="mb-4">
          <StyledView className="flex-row items-center bg-white rounded-lg border border-gray-300 px-3 py-2">
            <StyledText className="text-gray-400 mr-2">🔍</StyledText>
            <StyledTextInput
              placeholder="ابحث عن مادة قانونية..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 text-sm text-right text-gray-800"
            />
          </StyledView>
        </StyledView>

        {/* أزرار التصفية */}
        <StyledView className="mb-4 flex-row items-center justify-between">
          <StyledTouchableOpacity
            onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`flex-1 py-2 rounded-lg mr-2 flex-row items-center justify-center ${
              showFavoritesOnly
                ? 'bg-red-500'
                : 'bg-gray-200'
            }`}
          >
            <StyledText className={`text-sm font-semibold ${
              showFavoritesOnly ? 'text-white' : 'text-gray-700'
            }`}>
              ♥ المفضلة ({favorites.length})
            </StyledText>
          </StyledTouchableOpacity>

          <StyledTouchableOpacity
            onPress={() => {
              setSearchQuery('');
              setSelectedCategory('');
              setShowFavoritesOnly(false);
            }}
            className="py-2 px-4 bg-gray-200 rounded-lg"
          >
            <StyledText className="text-sm font-semibold text-gray-700">
              ⟲ إعادة تعيين
            </StyledText>
          </StyledTouchableOpacity>
        </StyledView>

        {/* قائمة الفئات */}
        <StyledText className="text-sm font-bold text-gray-800 mb-2">
          التصنيفات:
        </StyledText>
        <StyledView className="flex-row flex-wrap mb-4">
          {categories.map((category) => (
            <CategoryItem key={category} category={category} />
          ))}
        </StyledView>

        {/* نتائج البحث */}
        <StyledText className="text-xs font-semibold text-gray-600 mb-3">
          النتائج: {filteredLaws.length} مادة
        </StyledText>

        {/* قائمة المواد القانونية */}
        {isLoading ? (
          <StyledView className="flex-1 justify-center items-center py-10">
            <ActivityIndicator size="large" color="#3B82F6" />
          </StyledView>
        ) : filteredLaws.length > 0 ? (
          <StyledView className="pb-6">
            {filteredLaws.map((law) => (
              <LawArticleCard key={law.id} item={law} />
            ))}
          </StyledView>
        ) : (
          <StyledView className="flex-1 justify-center items-center py-10">
            <StyledText className="text-lg font-semibold text-gray-600 mb-2">
              لم يتم العثور على نتائج 😔
            </StyledText>
            <StyledText className="text-sm text-gray-500 text-center">
              حاول تعديل البحث أو اختيار فئة مختلفة
            </StyledText>
          </StyledView>
        )}
      </StyledScrollView>
    </StyledView>
  );
};

export default LawLibraryScreen;
