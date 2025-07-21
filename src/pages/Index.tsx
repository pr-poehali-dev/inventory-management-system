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

const Index = () => {
  const [activeTab, setActiveTab] = useState('inventory');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Начальные данные инвентаря
  const [inventory, setInventory] = useState<InventoryItem[]>([
    { id: '1', name: 'Вилки', count: 120, category: 'Столовые приборы' },
    { id: '2', name: 'Нож салатный', count: 80, category: 'Столовые приборы' },
    { id: '3', name: 'Нож стейковый', count: 45, category: 'Столовые приборы' },
    { id: '4', name: 'Ложка', count: 100, category: 'Столовые приборы' },
    { id: '5', name: 'Чайная ложка', count: 150, category: 'Столовые приборы' },
    { id: '6', name: 'Тарелки', count: 200, category: 'Посуда' },
    { id: '7', name: 'Щипцы под лед', count: 12, category: 'Специальные инструменты' },
    { id: '8', name: 'Щипцы под сахар', count: 8, category: 'Специальные инструменты' },
    { id: '9', name: 'Кулеры', count: 6, category: 'Оборудование' }
  ]);

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

  const updateItemCount = (id: string, newCount: number) => {
    setInventory(prev => prev.map(item => 
      item.id === id ? { ...item, count: Math.max(0, newCount) } : item
    ));
  };

  const getTotalItems = () => inventory.reduce((sum, item) => sum + item.count, 0);
  
  const getCategoryTotal = (category: string) => 
    inventory.filter(item => item.category === category)
             .reduce((sum, item) => sum + item.count, 0);

  const categories = Array.from(new Set(inventory.map(item => item.category)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Система инвентаризации
          </h1>
          <p className="text-lg text-gray-600">Рестораны Порт и Диккенс</p>
          <div className="mt-4 flex justify-center gap-4">
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              <Icon name="Utensils" className="mr-1" size={16} />
              Всего приборов: {getTotalItems()}
            </Badge>
            <Badge variant="outline" className="text-green-600 border-green-200">
              <Icon name="Calendar" className="mr-1" size={16} />
              Дата: {new Date().toLocaleDateString('ru-RU')}
            </Badge>
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Основная таблица */}
              <div className="lg:col-span-2">
                <Card className="shadow-lg border-0">
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <CardTitle className="flex items-center">
                      <Icon name="ClipboardList" className="mr-2" size={24} />
                      Учет посуды и приборов
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Наименование</TableHead>
                          <TableHead>Категория</TableHead>
                          <TableHead>Количество</TableHead>
                          <TableHead>Действия</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {inventory.map((item) => (
                          <TableRow key={item.id} className="hover:bg-gray-50">
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