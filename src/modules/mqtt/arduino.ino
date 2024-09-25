#ifdef ESP8266
  #include <ESP8266WiFi.h>
  #include <WiFiClientSecure.h>
#else
  #include <WiFi.h>
  #include <WiFiClientSecure.h>
#endif

#include <stdlib.h>
#include "DHTesp.h"
#include <ArduinoJson.h>
#include <PubSubClient.h>

/**** DHT11 sensor Settings *******/
#define DHTpin 2  // Set DHT pin as GPIO14 - D5
#define mqtt_topic_pub_sensor "sensor/data"
#define mqtt_topic_sub_led "led_state"
#define mqtt_topic_pub_led "response_status"
#define mqtt_topic_sub_ledSate "recieve/led-status"
DHTesp dht;

/**** LED Settings *******/
const int led1 = 5;  // Set LED pin as GPIO5 - D1
const int led3 = 16;  // Set LED pin as GPIO16 - D0
const int led2 = 4;  // Set LED pin as GPIO4 - D2
boolean stled1 = false;
boolean stled2 = false;
boolean stled3 = false;
boolean blinkLed1Status = false;

/****** WiFi Connection Details *******/
const char* ssid = "Đức";
const char* password = "11111111";

/******* MQTT Broker Connection Details *******/
const char* mqtt_server = "broker.emqx.io";
const int mqtt_port = 1883;
const char* mqtt_username = "huuduc"; // Tên người dùng MQTT
const char* mqtt_password = "123";    // Mật khẩu MQTT

/**** Secure WiFi Connectivity Initialisation *****/
WiFiClient espClient;
/**** MQTT Client Initialisation Using WiFi Connection *****/
PubSubClient client(espClient);

unsigned long lastMsg = 0;
#define MSG_BUFFER_SIZE (50)
char msg[MSG_BUFFER_SIZE];

/************* Connect to WiFi ***********/
// Hàm kết nối Wi-Fi
void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);
  
  int retries = 0;
  while (WiFi.status() != WL_CONNECTED && retries < 20) {
    delay(500);
    Serial.print(".");
    retries++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("");
    Serial.println("WiFi connected");
    Serial.println("IP address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("Failed to connect to Wi-Fi");
    // Nếu không kết nối được Wi-Fi, bạn có thể reset hoặc thực hiện hành động khác
  }
}
void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    String clientID = "ESPClient-";
    clientID += String(random(0xffff), HEX);

    // Kết nối tới MQTT Broker
    if (client.connect(clientID.c_str(), mqtt_username, mqtt_password)) {
      Serial.println("connected");

      // Subscribe vào các topic cần thiết
      client.subscribe(mqtt_topic_sub_led); 
      client.subscribe(mqtt_topic_sub_ledSate);
      
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Thử lại sau 5 giây nếu thất bại
      delay(5000);
    }
  }
}



void callback(char* topic, byte* payload, unsigned int length) {
  String incomingMessage = "";
  for (int i = 0; i < length; i++) {
    incomingMessage += (char)payload[i];
  }

  Serial.println("Message arrived [" + String(topic) + "]: " + incomingMessage);
  
  if (strcmp(topic, mqtt_topic_sub_led) == 0) {
    // Xử lý dữ liệu từ topic điều khiển LED
    DynamicJsonDocument doc(1024);
    DeserializationError error = deserializeJson(doc, incomingMessage);
    if (error) {
      Serial.print("deserializeJson() failed: ");
      Serial.println(error.c_str());
      return;
    }
    int led_id = doc["led_id"];
    String status = doc["status"];

    // Cập nhật trạng thái LED
    if (led_id == 1) {
      stled1 = (status.equals("ON"));
      digitalWrite(led1, stled1 ? HIGH : LOW);
    } else if (led_id == 2) {
      stled2 = (status.equals("ON"));
      digitalWrite(led2, stled2 ? HIGH : LOW);
    } else if (led_id == 3) {
      stled3 = (status.equals("ON"));
      digitalWrite(led3, stled3 ? HIGH : LOW);
    }

    // Gửi trạng thái cập nhật lên MQTT Broker
    DynamicJsonDocument responseDoc(1024);
    responseDoc["led_id"] = led_id;
    responseDoc["status"] = status;
    
    char responseMessage[256];
    serializeJson(responseDoc, responseMessage);
    client.publish(mqtt_topic_pub_led, responseMessage);

  } else if (strcmp(topic, mqtt_topic_sub_ledSate) == 0) {
    // Xử lý dữ liệu từ topic nhận trạng thái LED
    DynamicJsonDocument doc(1024);
    DeserializationError error = deserializeJson(doc, incomingMessage);
    
    if (error) {
      Serial.print("deserializeJson() failed: ");
      Serial.println(error.c_str());
      return;
    }
    Serial.println("[" + String(topic) + "]: " + incomingMessage);
    for (JsonObject obj : doc.as<JsonArray>()) {
      int led_id = obj["id"];
      bool status = obj["status"];

      // Cập nhật trạng thái LED dựa trên id và status
      if (led_id == 1) {
        stled1 = status;
        digitalWrite(led1, stled1 ? HIGH : LOW);
      } else if (led_id == 2) {
        stled2 = status;
        digitalWrite(led2, stled2 ? HIGH : LOW);
      } else if (led_id == 3) {
        stled3 = status;
        digitalWrite(led3, stled3 ? HIGH : LOW);
      }
    }
  }
}



void publishMessage(const char* topic, String payload, boolean retained) {
  if (client.publish(topic, payload.c_str(), retained)){
    Serial.println("[" + String(topic) + "]: " + payload);
  }
}

// void blinkLed1() {
//   static unsigned long lastBlinkTime = 0;  // Thời gian nhấp nháy trước đó
//   static bool ledState = LOW;  // Trạng thái hiện tại của LED
//   unsigned long currentMillis = millis();  // Lấy thời gian hiện tại

//   // Đặt thời gian nhấp nháy (1000 ms cho mỗi lần)
//   if (currentMillis - lastBlinkTime >= 100) { // Thay đổi 500 thành giá trị bạn muốn để điều chỉnh tốc độ nhấp nháy
//     ledState = !ledState; // Đổi trạng thái LED
//     digitalWrite(led1, ledState); // Ánh sáng LED
//     lastBlinkTime = currentMillis; // Cập nhật thời gian nhấp nháy
//   }
// }
unsigned long blinkInterval = 100; // Thay đổi giá trị này để tăng tốc độ nhấp nháy (mili giây)
unsigned long previousMillis = 0; // Biến để theo dõi thời gian đã trôi qua

void blinkLed1() {
  unsigned long currentMillis = millis();

  if (currentMillis - previousMillis >= blinkInterval) {
    previousMillis = currentMillis; // Cập nhật thời gian trước đó
    // Đổi trạng thái của LED 1
    if (digitalRead(led1) == LOW) {
      digitalWrite(led1, HIGH); // Bật LED
    } else {
      digitalWrite(led1, LOW); // Tắt LED
    }
  }
}

void setup() {
  Serial.begin(9600);
  while (!Serial) delay(1);
  Serial.println("Starting...");
  
  dht.setup(DHTpin, DHTesp::DHT11);  // Set up DHT11 sensor
  pinMode(led1, OUTPUT);
  pinMode(led3, OUTPUT);
  pinMode(led2, OUTPUT);  // Set up LED

  setup_wifi();

  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
}

void loop() {
  if (!client.connected()){
    reconnect(); 

  } // Check if client is connected
  client.loop();

  long now = millis();
  if (now - lastMsg > 3000) {
    // Read DHT11 temperature and humidity
    //delay(dht.getMinimumSamplingPeriod()); // Thời gian lấy mẫu tối thiểu
    //int sensorValue = analogRead(A0);  // Đọc giá trị từ chân ADC (A0)
    float light = 1024 - analogRead(A0);//calculateResistance(sensorValue);
    float humidity = dht.getHumidity();
    float temperature = dht.getTemperature();
    int ran = rand() % 100;  
    lastMsg = now;
    
    // Tạo JSON payload
    DynamicJsonDocument doc(1024);
    doc["humidity"] = humidity;
    doc["temperature"] = temperature;
    doc["light"] = light;
   
    
    char mqtt_message[256];
    serializeJson(doc, mqtt_message);
    publishMessage(mqtt_topic_pub_sensor, mqtt_message, true);

    if (light > 800) { // Kiểm tra nếu ánh sáng lớn hơn 700 lux
      blinkLed1Status = true; // Đặt trạng thái nhấp nháy thành true
      blinkLed1(); // Gọi hàm nhấp nháy LED 1
    } else {
      blinkLed1Status = false; // Đặt trạng thái nhấp nháy thành false
      digitalWrite(led1, stled1 ? HIGH : LOW); // Tắt LED nếu ánh sáng không lớn hơn 700 lux
    }
    if (blinkLed1Status) {
      blinkLed1();
    } else {
      digitalWrite(led1, stled1 ? HIGH : LOW); // Tắt LED nếu không nhấp nháy
    }

  }
}
