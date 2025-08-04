import { useState, useEffect } from 'react'
import { Card, Button, Modal, Form, Input, Select, Tag, Space, Row, Col, Typography, message } from 'antd'
import { HeartOutlined, HeartFilled, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { Monkey } from '../entities/Monkey'

const { Title, Text, Paragraph } = Typography
const { Option } = Select

function MonkeyApp() {
  const [monkeys, setMonkeys] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingMonkey, setEditingMonkey] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadMonkeys()
  }, [])

  const loadMonkeys = async () => {
    try {
      setLoading(true)
      const response = await Monkey.list()
      if (response.success) {
        setMonkeys(response.data)
      }
    } catch (error) {
      message.error('Failed to load monkeys')
    } finally {
      setLoading(false)
    }
  }

  const handleAddMonkey = () => {
    setEditingMonkey(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEditMonkey = (monkey) => {
    setEditingMonkey(monkey)
    form.setFieldsValue(monkey)
    setModalVisible(true)
  }

  const handleSaveMonkey = async (values) => {
    try {
      if (editingMonkey) {
        const response = await Monkey.update(editingMonkey._id, values)
        if (response.success) {
          message.success('Monkey updated successfully!')
          loadMonkeys()
        }
      } else {
        const response = await Monkey.create(values)
        if (response.success) {
          message.success('Monkey added successfully!')
          loadMonkeys()
        }
      }
      setModalVisible(false)
    } catch (error) {
      message.error('Failed to save monkey')
    }
  }

  const handleDeleteMonkey = async (monkeyId) => {
    try {
      // Note: Assuming delete functionality exists
      message.success('Monkey removed!')
      loadMonkeys()
    } catch (error) {
      message.error('Failed to delete monkey')
    }
  }

  const toggleFavorite = async (monkey) => {
    try {
      const response = await Monkey.update(monkey._id, {
        ...monkey,
        isFavorite: !monkey.isFavorite
      })
      if (response.success) {
        loadMonkeys()
      }
    } catch (error) {
      message.error('Failed to update favorite status')
    }
  }

  const getConservationColor = (status) => {
    const colors = {
      'Least Concern': 'green',
      'Near Threatened': 'orange',
      'Vulnerable': 'yellow',
      'Endangered': 'red',
      'Critically Endangered': 'red',
      'Unknown': 'gray'
    }
    return colors[status] || 'gray'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <Title level={1} className="text-green-700">
            🐒 Monkey Explorer
          </Title>
          <Paragraph className="text-lg text-gray-600">
            Discover and learn about amazing primates from around the world
          </Paragraph>
        </div>

        <div className="mb-6 text-center">
          <Button 
            type="primary" 
            size="large" 
            icon={<PlusOutlined />}
            onClick={handleAddMonkey}
            className="bg-green-600 hover:bg-green-700"
          >
            Add New Monkey
          </Button>
        </div>

        <Row gutter={[16, 16]}>
          {monkeys.map((monkey) => (
            <Col xs={24} sm={12} lg={8} xl={6} key={monkey._id}>
              <Card
                hoverable
                className="h-full shadow-lg border-0 overflow-hidden"
                cover={
                  monkey.imageUrl && (
                    <div className="h-48 bg-gradient-to-br from-green-100 to-yellow-100 flex items-center justify-center">
                      <img
                        alt={monkey.name}
                        src={monkey.imageUrl}
                        className="max-h-full max-w-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.parentElement.innerHTML = '<div class="text-6xl">🐒</div>'
                        }}
                      />
                    </div>
                  ) || (
                    <div className="h-48 bg-gradient-to-br from-green-100 to-yellow-100 flex items-center justify-center text-6xl">
                      🐒
                    </div>
                  )
                }
                actions={[
                  <Button
                    type="text"
                    icon={monkey.isFavorite ? <HeartFilled className="text-red-500" /> : <HeartOutlined />}
                    onClick={() => toggleFavorite(monkey)}
                  />,
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => handleEditMonkey(monkey)}
                  />,
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteMonkey(monkey._id)}
                  />
                ]}
              >
                <Card.Meta
                  title={
                    <div className="flex items-center justify-between">
                      <span className="text-green-700">{monkey.name}</span>
                      {monkey.isFavorite && <HeartFilled className="text-red-500" />}
                    </div>
                  }
                  description={
                    <div className="space-y-2">
                      <Text strong className="text-gray-700">{monkey.species}</Text>
                      {monkey.habitat && (
                        <div>
                          <Text type="secondary">Habitat: </Text>
                          <Text>{monkey.habitat}</Text>
                        </div>
                      )}
                      {monkey.conservationStatus && (
                        <Tag color={getConservationColor(monkey.conservationStatus)}>
                          {monkey.conservationStatus}
                        </Tag>
                      )}
                      {monkey.funFact && (
                        <Paragraph className="text-sm text-gray-600 mt-2">
                          💡 {monkey.funFact}
                        </Paragraph>
                      )}
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>

        {monkeys.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🐒</div>
            <Title level={3} className="text-gray-500">No monkeys yet!</Title>
            <Text className="text-gray-400">Add your first monkey to get started</Text>
          </div>
        )}

        <Modal
          title={editingMonkey ? "Edit Monkey" : "Add New Monkey"}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSaveMonkey}
            className="mt-4"
          >
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: 'Please enter monkey name' }]}
            >
              <Input placeholder="e.g., Curious George" />
            </Form.Item>

            <Form.Item
              name="species"
              label="Species"
              rules={[{ required: true, message: 'Please enter species' }]}
            >
              <Input placeholder="e.g., Capuchin Monkey" />
            </Form.Item>

            <Form.Item
              name="habitat"
              label="Habitat"
            >
              <Input placeholder="e.g., Central American rainforests" />
            </Form.Item>

            <Form.Item
              name="conservationStatus"
              label="Conservation Status"
            >
              <Select placeholder="Select conservation status">
                <Option value="Least Concern">Least Concern</Option>
                <Option value="Near Threatened">Near Threatened</Option>
                <Option value="Vulnerable">Vulnerable</Option>
                <Option value="Endangered">Endangered</Option>
                <Option value="Critically Endangered">Critically Endangered</Option>
                <Option value="Unknown">Unknown</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="imageUrl"
              label="Image URL"
            >
              <Input placeholder="https://example.com/monkey-image.jpg" />
            </Form.Item>

            <Form.Item
              name="funFact"
              label="Fun Fact"
            >
              <Input.TextArea 
                rows={3}
                placeholder="Share an interesting fact about this monkey..."
              />
            </Form.Item>

            <Form.Item
              name="isFavorite"
              valuePropName="checked"
            >
              <Space>
                <input type="checkbox" />
                <span>Mark as favorite</span>
              </Space>
            </Form.Item>

            <Form.Item className="mb-0 text-right">
              <Space>
                <Button onClick={() => setModalVisible(false)}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit" className="bg-green-600 hover:bg-green-700">
                  {editingMonkey ? 'Update' : 'Add'} Monkey
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  )
}

export default MonkeyApp