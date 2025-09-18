import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { TrendingUp, Calendar, CreditCard, Truck, Clock } from 'lucide-react';
import { formatCurrency, formatPercent, parseNumberInput } from '../lib/utils';
import { useFinanceState } from '../hooks/useFinanceState';

export default function SalesModel() {
  const { data, updateSalesModel } = useFinanceState();
  const [salesData, setSalesData] = useState(() => data?.salesModel || {});
  const [forecastDaily, setForecastDaily] = useState(salesData.forecastDailyUnits);
  const [paymentFee, setPaymentFee] = useState(salesData.paymentFeePercent);
  const [deliveryCommission, setDeliveryCommission] = useState(salesData.deliveryCommissionPercent);

  const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const seasonalityKeys = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const handleSeasonalityChange = (month: string, value: number) => {
    const newSeasonality = { ...salesData.seasonality, [month]: value / 100 };
    const updatedSalesData = { ...salesData, seasonality: newSeasonality };
    setSalesData(updatedSalesData);
    financeEngine.updateSalesModel(updatedSalesData);
    onUpdate();
  };

  const handleForecastChange = (value: number) => {
    setForecastDaily(value);
    const updatedSalesData = { ...salesData, forecastDailyUnits: value };
    setSalesData(updatedSalesData);
    updateSalesModel(updatedSalesData);
  };

  const handlePaymentFeeChange = (value: number) => {
    setPaymentFee(value);
    const updatedSalesData = { ...salesData, paymentFeePercent: value };
    setSalesData(updatedSalesData);
    updateSalesModel(updatedSalesData);
  };

  const handleDeliveryCommissionChange = (value: number) => {
    setDeliveryCommission(value);
    const updatedSalesData = { ...salesData, deliveryCommissionPercent: value };
    setSalesData(updatedSalesData);
    updateSalesModel(updatedSalesData);
  };

  const calculateMonthlyUnits = (month: string) => {
    const seasonalityFactor = salesData.seasonality[month] || 1;
    return Math.round(forecastDaily * 30 * seasonalityFactor);
  };

  const calculateMonthlyRevenue = (month: string) => {
    const units = calculateMonthlyUnits(month);
    const avgPrice = 60; // This should come from menu data
    return units * avgPrice;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">โมเดลยอดขาย</h2>
          <p className="text-muted-foreground">จัดการการคาดการณ์ยอดขายและค่าธรรมเนียม</p>
        </div>
        <Badge variant="outline">
          รายได้เดือนละ {formatCurrency(calculateMonthlyRevenue('Jan'))}
        </Badge>
      </div>

      <Tabs defaultValue="forecast" className="space-y-4">
        <TabsList>
          <TabsTrigger value="forecast">คาดการณ์ยอดขาย</TabsTrigger>
          <TabsTrigger value="seasonality">ปรับปรุงตามฤดูกาล</TabsTrigger>
          <TabsTrigger value="channels">ช่องทางและค่าธรรมเนียม</TabsTrigger>
          <TabsTrigger value="schedule">เวลาดำเนินการ</TabsTrigger>
        </TabsList>

        <TabsContent value="forecast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                การคาดการณ์ยอดขายรายวัน
              </CardTitle>
              <CardDescription>
                ตั้งค่าจำนวนจานที่คาดว่าจะขายได้ต่อวัน
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="daily-forecast">จำนวนจานต่อวัน</Label>
                  <Input
                    id="daily-forecast"
                    type="number"
                    value={forecastDaily}
                    onChange={(e) => handleForecastChange(parseNumberInput(e.target.value))}
                    placeholder="120"
                  />
                  <p className="text-sm text-muted-foreground">
                    ยอดขายเฉลี่ยต่อวันที่คาดการณ์
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>ปรับด้วย Slider</Label>
                  <Slider
                    value={[forecastDaily]}
                    onValueChange={(value) => handleForecastChange(value[0])}
                    max={300}
                    min={50}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>50 จาน</span>
                    <span>300 จาน</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <Card className="p-4">
                  <div className="text-sm font-medium text-muted-foreground">รายวัน</div>
                  <div className="text-xl font-bold">{forecastDaily} จาน</div>
                </Card>
                <Card className="p-4">
                  <div className="text-sm font-medium text-muted-foreground">รายสัปดาห์</div>
                  <div className="text-xl font-bold">{forecastDaily * 7} จาน</div>
                </Card>
                <Card className="p-4">
                  <div className="text-sm font-medium text-muted-foreground">รายเดือน</div>
                  <div className="text-xl font-bold">{forecastDaily * 30} จาน</div>
                </Card>
                <Card className="p-4">
                  <div className="text-sm font-medium text-muted-foreground">รายปี</div>
                  <div className="text-xl font-bold">{forecastDaily * 365} จาน</div>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seasonality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                ปรับปรุงตามฤดูกาล
              </CardTitle>
              <CardDescription>
                ตั้งค่าการเปลี่ยนแปลงยอดขายในแต่ละเดือน (100% = ปกติ)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {seasonalityKeys.map((month, index) => {
                  const percentage = Math.round((salesData.seasonality[month] || 1) * 100);
                  return (
                    <div key={month} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm">{monthNames[index]}</Label>
                        <Badge variant={percentage > 100 ? 'default' : percentage < 90 ? 'destructive' : 'secondary'}>
                          {percentage}%
                        </Badge>
                      </div>
                      <Slider
                        value={[percentage]}
                        onValueChange={(value) => handleSeasonalityChange(month, value[0])}
                        max={150}
                        min={50}
                        step={5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{calculateMonthlyUnits(month)} จาน</span>
                        <span>{formatCurrency(calculateMonthlyRevenue(month))}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channels" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  ค่าธรรมเนียมการชำระเงิน
                </CardTitle>
                <CardDescription>
                  ค่าธรรมเนียมบัตรเครดิต/QR Payment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="payment-fee">ค่าธรรมเนียม (%)</Label>
                  <Input
                    id="payment-fee"
                    type="number"
                    step="0.1"
                    value={paymentFee}
                    onChange={(e) => handlePaymentFeeChange(parseFloat(e.target.value) || 0)}
                    placeholder="1.5"
                  />
                  <p className="text-sm text-muted-foreground">
                    ค่าธรรมเนียมเฉลี่ยของการชำระเงินแบบไม่ใช้เงินสด
                  </p>
                </div>
                
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm font-medium">ผลกระทบต่อรายได้</div>
                  <div className="text-lg font-bold text-red-600">
                    -{formatCurrency((calculateMonthlyRevenue('Jan') * paymentFee) / 100)} /เดือน
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  ค่าคอมมิชชันเดลิเวอรี
                </CardTitle>
                <CardDescription>
                  ค่าคอมมิชชันแพลตฟอร์มเดลิเวอรี
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="delivery-commission">ค่าคอมมิชชัน (%)</Label>
                  <Input
                    id="delivery-commission"
                    type="number"
                    step="0.1"
                    value={deliveryCommission}
                    onChange={(e) => handleDeliveryCommissionChange(parseFloat(e.target.value) || 0)}
                    placeholder="25"
                  />
                  <p className="text-sm text-muted-foreground">
                    ค่าคอมมิชชันของแพลตฟอร์มเดลิเวอรี (Grab, Foodpanda)
                  </p>
                </div>
                
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm font-medium">ผลกระทบยอดเดลิเวอรี</div>
                  <div className="text-lg font-bold text-red-600">
                    -{formatCurrency((calculateMonthlyRevenue('Jan') * 0.1 * deliveryCommission) / 100)} /เดือน
                  </div>
                  <div className="text-xs text-muted-foreground">
                    สมมติเดลิเวอรี 10% ของยอดขาย
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                เวลาดำเนินการ
              </CardTitle>
              <CardDescription>
                ตั้งค่าวันและเวลาเปิด-ปิดร้าน
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label>วันเปิดทำการ</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์'].map((day, index) => (
                      <div key={day} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`day-${index}`}
                          defaultChecked={index < 6} // Default open Mon-Sat
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor={`day-${index}`} className="text-sm">{day}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="open-time">เวลาเปิด</Label>
                    <Input
                      id="open-time"
                      type="time"
                      defaultValue="07:00"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="close-time">เวลาปิด</Label>
                    <Input
                      id="close-time"
                      type="time"
                      defaultValue="15:00"
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium text-blue-900">ข้อมูลสรุป</div>
                <div className="text-sm text-blue-700">
                  เปิดทำการ 6 วัน/สัปดาห์ × 8 ชั่วโมง/วัน = 48 ชั่วโมง/สัปดาห์
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}