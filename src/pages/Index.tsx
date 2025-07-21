import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface InventoryItem {
  id: string;
  name: string;
  count: number;
  category: string;
}

interface WeeklyData {
  date: string;
  totalItems: number;
  changes: { [key: string]: number };
}

interface RestaurantData {
  [key: string]: InventoryItem[];
}

const Index = () => {
  const [activeTab, setActiveTab] = useState('inventory');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedRestaurant, setSelectedRestaurant] = useState('PORT');
  
  // Поиск и фильтры
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showComparison, setShowComparison] = useState(false);
  
  // Новая позиция
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    count: 0
  });
  
  // Данные по ресторанам
  const [restaurantData, setRestaurantData] = useState<RestaurantData>({
    'PORT': [
      { id: '1', name: 'Вилки', count: 120, category: 'Столовые приборы' },
      { id: '2', name: 'Нож салатный', count: 80, category: 'Столовые приборы' },
      { id: '3', name: 'Нож стейковый', count: 45, category: 'Столовые приборы' },
      { id: '4', name: 'Ложка', count: 100, category: 'Столовые приборы' },
      { id: '5', name: 'Чайная ложка', count: 150, category: 'Столовые приборы' },
      { id: '6', name: 'Тарелки', count: 200, category: 'Посуда' },
      { id: '7', name: 'Щипцы под лед', count: 12, category: 'Специальные инструменты' },
      { id: '8', name: 'Щипцы под сахар', count: 8, category: 'Специальные инструменты' },
      { id: '9', name: 'Кулеры', count: 6, category: 'Оборудование' }
    ],
    'Диккенс': [
      { id: '10', name: 'Вилки', count: 95, category: 'Столовые приборы' },
      { id: '11', name: 'Нож салатный', count: 65, category: 'Столовые приборы' },
      { id: '12', name: 'Нож стейковый', count: 38, category: 'Столовые приборы' },
      { id: '13', name: 'Ложка', count: 85, category: 'Столовые приборы' },
      { id: '14', name: 'Чайная ложка', count: 125, category: 'Столовые приборы' },
      { id: '15', name: 'Тарелки', count: 170, category: 'Посуда' },
      { id: '16', name: 'Щипцы под лед', count: 8, category: 'Специальные инструменты' },
      { id: '17', name: 'Щипцы под сахар', count: 6, category: 'Специальные инструменты' },
      { id: '18', name: 'Кулеры', count: 4, category: 'Оборудование' }
    ]
  });
  
  // Текущий инвентарь
  const inventory = restaurantData[selectedRestaurant] || [];

  // Генерация воскресений до декабря 2025
  const generateSundays = () => {
    const sundays = [];
    const start = new Date('2024-07-28'); // Ближайшее воскресенье
    const end = new Date('2025-12-31');
    
    for (let date = start; date <= end; date.setDate(date.getDate() + 7)) {
      if (date.getDay() === 0) { // Воскресенье
        sundays.push(new Date(date).toLocaleDateString('ru-RU'));
      }
    }
    return sundays;
  };

  const [sundays] = useState(generateSundays());
  
  // Данные для графиков
  const chartData = [
    { week: 'Нед 1', total: 721, вилки: 120, ножи: 125, ложки: 250, тарелки: 200 },
    { week: 'Нед 2', total: 735, вилки: 118, ножи: 128, ложки: 255, тарелки: 205 },
    { week: 'Нед 3', total: 742, вилки: 122, ножи: 123, ложки: 248, тарелки: 210 },
    { week: 'Нед 4', total: 715, вилки: 115, ножи: 120, ложки: 245, тарелки: 195 }
  ];

  // Фильтрация инвентаря
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Все' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const updateItemCount = (id: string, newCount: number) => {
    setRestaurantData(prev => ({
      ...prev,
      [selectedRestaurant]: prev[selectedRestaurant].map(item => 
        item.id === id ? { ...item, count: Math.max(0, newCount) } : item
      )
    }));
  };

  const addNewItem = () => {
    if (newItem.name && newItem.category) {
      const id = Date.now().toString();
      setRestaurantData(prev => ({
        ...prev,
        [selectedRestaurant]: [...prev[selectedRestaurant], { ...newItem, id }]
      }));
      setNewItem({ name: '', category: '', count: 0 });
      setShowAddForm(false);
    }
  };

  const deleteSelectedItems = () => {
    setRestaurantData(prev => ({
      ...prev,
      [selectedRestaurant]: prev[selectedRestaurant].filter(item => !selectedItems.has(item.id))
    }));
    setSelectedItems(new Set());
  };

  const toggleItemSelection = (id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectAllItems = () => {
    if (selectedItems.size === filteredInventory.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredInventory.map(item => item.id)));
    }
  };

  const getTotalItems = (restaurant?: string) => {
    const data = restaurant ? restaurantData[restaurant] || [] : inventory;
    return data.reduce((sum, item) => sum + item.count, 0);
  };
  
  const getCategoryTotal = (category: string) => 
    inventory.filter(item => item.category === category)
             .reduce((sum, item) => sum + item.count, 0);

  const categories = ['Все', ...Array.from(new Set(inventory.map(item => item.category)))];
  
  // Данные для сравнения
  const getComparisonData = () => {
    const portItems = restaurantData['PORT'] || [];
    const dickensItems = restaurantData['Диккенс'] || [];
    
    const allItemNames = Array.from(new Set([
      ...portItems.map(item => item.name),
      ...dickensItems.map(item => item.name)
    ]));
    
    return allItemNames.map(name => {
      const portItem = portItems.find(item => item.name === name);
      const dickensItem = dickensItems.find(item => item.name === name);
      
      return {
        name,
        port: portItem ? portItem.count : 0,
        dickens: dickensItem ? dickensItem.count : 0,
        difference: (portItem ? portItem.count : 0) - (dickensItem ? dickensItem.count : 0)
      };
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Система инвентаризации
          </h1>
          <p className="text-lg text-gray-600">Рестораны Порт и Диккенс</p>
          
          {/* Переключатель ресторанов */}
          <div className="mt-6 flex justify-center">
            <div className="flex bg-white rounded-lg shadow-md p-1 border">
              <Button 
                onClick={() => setSelectedRestaurant('PORT')}
                variant={selectedRestaurant === 'PORT' ? 'default' : 'ghost'}
                className={`px-6 py-2 rounded-md transition-all ${selectedRestaurant === 'PORT' 
                  ? 'bg-blue-500 text-white shadow-sm' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <Icon name="Anchor" className="mr-2" size={18} />
                PORT
              </Button>
              <Button 
                onClick={() => setSelectedRestaurant('Диккенс')}
                variant={selectedRestaurant === 'Диккенс' ? 'default' : 'ghost'}
                className={`px-6 py-2 rounded-md transition-all ${selectedRestaurant === 'Диккенс' 
                  ? 'bg-blue-500 text-white shadow-sm' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <Icon name="BookOpen" className="mr-2" size={18} />
                Диккенс
              </Button>
              <Button 
                onClick={() => setShowComparison(!showComparison)}
                variant={showComparison ? 'default' : 'ghost'}
                className={`px-6 py-2 rounded-md transition-all ${showComparison
                  ? 'bg-green-500 text-white shadow-sm' 
                  : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                }`}
              >
                <Icon name="GitCompare" className="mr-2" size={18} />
                Сравнение
              </Button>
            </div>
          </div>
          
          <div className="mt-4 flex justify-center gap-4">
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              <Icon name="Utensils" className="mr-1" size={16} />
              {showComparison ? `Общий итог` : `${selectedRestaurant}: ${getTotalItems()} приборов`}
            </Badge>
            <Badge variant="outline" className="text-green-600 border-green-200">
              <Icon name="Calendar" className="mr-1" size={16} />
              Дата: {new Date().toLocaleDateString('ru-RU')}
            </Badge>
            {showComparison && (
              <>
                <Badge variant="outline" className="text-purple-600 border-purple-200">
                  PORT: {getTotalItems('PORT')}
                </Badge>
                <Badge variant="outline" className="text-orange-600 border-orange-200">
                  Диккенс: {getTotalItems('Диккенс')}
                </Badge>
              </>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 mb-8 bg-white shadow-sm">
            <TabsTrigger value="inventory" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <Icon name="Package" className="mr-2" size={18} />
              Инвентаризация
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <Icon name="BarChart3" className="mr-2" size={18} />
              Отчеты
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <Icon name="History" className="mr-2" size={18} />
              История
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <Icon name="Settings" className="mr-2" size={18} />
              Настройки
            </TabsTrigger>
            <TabsTrigger value="calendar" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <Icon name="CalendarDays" className="mr-2" size={18} />
              Календарь
            </TabsTrigger>
          </TabsList>

          {/* Инвентаризация */}
          <TabsContent value="inventory">
            {showComparison ? (
              /* Режим сравнения */
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                  <CardTitle className="flex items-center">
                    <Icon name="GitCompare" className="mr-2" size={24} />
                    Сравнение ресторанов
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Наименование</TableHead>
                        <TableHead className="text-center">PORT</TableHead>
                        <TableHead className="text-center">Диккенс</TableHead>
                        <TableHead className="text-center">Разность</TableHead>
                        <TableHead className="text-center">Статус</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getComparisonData().map((item, index) => (
                        <TableRow key={index} className="hover:bg-gray-50">
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              {item.port}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="bg-orange-50 text-orange-700">
                              {item.dickens}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge 
                              variant="outline" 
                              className={item.difference > 0 
                                ? 'bg-green-50 text-green-700 border-green-200' 
                                : item.difference < 0
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-gray-50 text-gray-700'
                              }
                            >
                              {item.difference > 0 ? '+' : ''}{item.difference}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {Math.abs(item.difference) > 10 ? (
                              <Icon name="AlertTriangle" className="text-yellow-500" size={20} />
                            ) : Math.abs(item.difference) > 20 ? (
                              <Icon name="AlertCircle" className="text-red-500" size={20} />
                            ) : (
                              <Icon name="CheckCircle" className="text-green-500" size={20} />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Основная таблица */}
              <div className="lg:col-span-2">
                <Card className="shadow-lg border-0">
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Icon name="ClipboardList" className="mr-2" size={24} />
                        Учет посуды и приборов
                      </div>
                      <Button 
                        onClick={() => setShowAddForm(!showAddForm)}
                        variant="outline"
                        className="bg-white text-blue-600 hover:bg-blue-50 border-white"
                        size="sm"
                      >
                        <Icon name="Plus" className="mr-1" size={16} />
                        Добавить
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {/* Панель поиска и фильтров */}
                    <div className="mb-6 space-y-4">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                          <div className="relative">
                            <Icon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <Input
                              placeholder="Поиск по названию..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>
                        <select 
                          value={selectedCategory} 
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>
                      
                      {/* Массовые операции */}
                      {selectedItems.size > 0 && (
                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border">
                          <span className="text-sm font-medium text-blue-700">
                            Выбрано: {selectedItems.size} элементов
                          </span>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={deleteSelectedItems}
                            className="ml-auto"
                          >
                            <Icon name="Trash2" className="mr-1" size={14} />
                            Удалить
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Форма добавления */}
                    {showAddForm && (
                      <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                        <h3 className="text-lg font-medium mb-3">Добавить новую позицию</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                          <Input
                            placeholder="Название"
                            value={newItem.name}
                            onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                          />
                          <select 
                            value={newItem.category} 
                            onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Категория</option>
                            <option value="Столовые приборы">Столовые приборы</option>
                            <option value="Посуда">Посуда</option>
                            <option value="Специальные инструменты">Специальные инструменты</option>
                            <option value="Оборудование">Оборудование</option>
                          </select>
                          <Input
                            type="number"
                            placeholder="Количество"
                            value={newItem.count}
                            onChange={(e) => setNewItem(prev => ({ ...prev, count: parseInt(e.target.value) || 0 }))}
                          />
                          <div className="flex gap-2">
                            <Button onClick={addNewItem} className="flex-1">
                              <Icon name="Check" className="mr-1" size={14} />
                              Добавить
                            </Button>
                            <Button onClick={() => setShowAddForm(false)} variant="outline">
                              <Icon name="X" size={14} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <input 
                              type="checkbox" 
                              checked={selectedItems.size === filteredInventory.length && filteredInventory.length > 0}
                              onChange={selectAllItems}
                              className="rounded"
                            />
                          </TableHead>
                          <TableHead>Наименование</TableHead>
                          <TableHead>Категория</TableHead>
                          <TableHead>Количество</TableHead>
                          <TableHead>Действия</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredInventory.map((item) => (
                          <TableRow key={item.id} className="hover:bg-gray-50">
                            <TableCell>
                              <input 
                                type="checkbox" 
                                checked={selectedItems.has(item.id)}
                                onChange={() => toggleItemSelection(item.id)}
                                className="rounded"
                              />
                            </TableCell>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{item.category}</Badge>
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={item.count}
                                onChange={(e) => updateItemCount(item.id, parseInt(e.target.value) || 0)}
                                className="w-20 text-center"
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => updateItemCount(item.id, item.count + 1)}
                                >
                                  <Icon name="Plus" size={14} />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => updateItemCount(item.id, item.count - 1)}
                                >
                                  <Icon name="Minus" size={14} />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    
                    {filteredInventory.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Icon name="Package" className="mx-auto mb-2" size={48} />
                        <p>Ничего не найдено</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Сводка по категориям */}
              <div>
                <Card className="shadow-lg border-0">
                  <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                    <CardTitle className="flex items-center">
                      <Icon name="PieChart" className="mr-2" size={20} />
                      Сводка по категориям
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {categories.map(category => (
                        <div key={category} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-700">{category}</span>
                          <Badge className="bg-blue-100 text-blue-800">
                            {getCategoryTotal(category)}
                          </Badge>
                        </div>
                      ))}
                      <div className="border-t pt-4 mt-4">
                        <div className="flex justify-between items-center text-lg font-bold">
                          <span>Общий итог:</span>
                          <Badge className="bg-green-500 text-white text-lg px-3 py-1">
                            {getTotalItems()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            )}
          </TabsContent>

          {/* Отчеты */}
          <TabsContent value="reports">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle>Динамика общего количества</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle>Распределение по типам</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="вилки" fill="#3b82f6" />
                      <Bar dataKey="ножи" fill="#ef4444" />
                      <Bar dataKey="ложки" fill="#10b981" />
                      <Bar dataKey="тарелки" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* История */}
          <TabsContent value="history">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Журнал изменений</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-4 bg-green-50 border-l-4 border-green-400 rounded">
                    <div className="flex justify-between">
                      <span className="font-medium">Добавлено 5 вилок</span>
                      <span className="text-sm text-gray-500">21.07.2024 14:30</span>
                    </div>
                  </div>
                  <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded">
                    <div className="flex justify-between">
                      <span className="font-medium">Списано 2 стейковых ножа</span>
                      <span className="text-sm text-gray-500">20.07.2024 11:15</span>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
                    <div className="flex justify-between">
                      <span className="font-medium">Инвентаризация завершена</span>
                      <span className="text-sm text-gray-500">20.07.2024 09:00</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Настройки */}
          <TabsContent value="settings">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Управление системой</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full bg-blue-500 hover:bg-blue-600">
                  <Icon name="Download" className="mr-2" size={16} />
                  Экспорт данных
                </Button>
                <Button className="w-full" variant="outline">
                  <Icon name="Upload" className="mr-2" size={16} />
                  Импорт данных
                </Button>
                <Button className="w-full" variant="outline">
                  <Icon name="Settings" className="mr-2" size={16} />
                  Настройки уведомлений
                </Button>
                <Button className="w-full bg-red-500 hover:bg-red-600">
                  <Icon name="Trash2" className="mr-2" size={16} />
                  Очистить историю
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Календарь */}
          <TabsContent value="calendar">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle>Расписание проверок</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="rounded-md border"
                  />
                </CardContent>
              </Card>
              
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle>Воскресенья до декабря 2025</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {sundays.map((sunday, index) => (
                      <div key={index} className="p-2 bg-gray-50 rounded flex justify-between items-center">
                        <span>{sunday}</span>
                        <Badge variant="outline">
                          Неделя {index + 1}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;