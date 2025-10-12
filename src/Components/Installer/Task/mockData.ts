export const mockTaskData = {
  data: [
    {
      id: "1",
      dateAssigned: "2024-06-12",
      taskValidity: "18/06/2024",
      requestingAgent: "Musa Mansa",
      pickupLocation: "Somewhere in Nigeria",
      productType: ["EAAS", "RECHARGE"],
      deviceId: "232424242",
      tokenStatus: "Yes",
      status: "pending"
    },
    {
      id: "2",
      dateAssigned: "2024-06-11",
      taskValidity: "17/06/2024",
      requestingAgent: "John Smith",
      pickupLocation: "Lagos, Nigeria",
      productType: ["EAAS", "RECHARGE"],
      deviceId: "232424243",
      tokenStatus: "Yes",
      status: "accepted"
    },
    {
      id: "3",
      dateAssigned: "2024-06-10",
      taskValidity: "16/06/2024",
      requestingAgent: "Sarah Johnson",
      pickupLocation: "Abuja, Nigeria",
      productType: ["EAAS", "RECHARGE"],
      deviceId: "232424244",
      tokenStatus: "No",
      status: "completed"
    }
  ],
  total: 3,
  page: 1,
  limit: 10
};

export const mockTaskHistoryData = {
  total: 30,
  page: 1,
  limit: 15,
  tasks: [
    {
      id: "1",
      taskId: "TASK001",
      productType: "EAAS RECHARGE",
      warehouse: "Abuja",
      installationAddress: "Abuja",
      status: "COMPLETED",
      createdAt: "2024-07-22T12:32:00Z",
      updatedAt: "2024-07-22T14:30:00Z",
      customer: {
        id: "1",
        firstname: "John",
        lastname: "Doe",
        email: "john.doe@example.com",
        phone: "08012345678",
        location: "Abuja"
      }
    },
    {
      id: "2",
      taskId: "TASK002",
      productType: "EAAS RECHARGE",
      warehouse: "Abuja",
      installationAddress: "Abuja",
      status: "COMPLETED",
      createdAt: "2024-07-22T12:32:00Z",
      updatedAt: "2024-07-22T14:30:00Z",
      customer: {
        id: "2",
        firstname: "Jane",
        lastname: "Smith",
        email: "jane.smith@example.com",
        phone: "08087654321",
        location: "Abuja"
      }
    },
    {
      id: "3",
      taskId: "TASK003",
      productType: "EAAS RECHARGE",
      warehouse: "Abuja",
      installationAddress: "Abuja",
      status: "COMPLETED",
      createdAt: "2024-07-22T12:32:00Z",
      updatedAt: "2024-07-22T14:30:00Z",
      customer: {
        id: "3",
        firstname: "Mike",
        lastname: "Johnson",
        email: "mike.johnson@example.com",
        phone: "08011223344",
        location: "Abuja"
      }
    },
    {
      id: "4",
      taskId: "TASK004",
      productType: "EAAS RECHARGE",
      warehouse: "Abuja",
      installationAddress: "Abuja",
      status: "COMPLETED",
      createdAt: "2024-07-22T12:32:00Z",
      updatedAt: "2024-07-22T14:30:00Z",
      customer: {
        id: "4",
        firstname: "Sarah",
        lastname: "Wilson",
        email: "sarah.wilson@example.com",
        phone: "08055667788",
        location: "Abuja"
      }
    },
    {
      id: "5",
      taskId: "TASK005",
      productType: "EAAS RECHARGE",
      warehouse: "Abuja",
      installationAddress: "Abuja",
      status: "COMPLETED",
      createdAt: "2024-07-22T12:32:00Z",
      updatedAt: "2024-07-22T14:30:00Z",
      customer: {
        id: "5",
        firstname: "David",
        lastname: "Brown",
        email: "david.brown@example.com",
        phone: "08099887766",
        location: "Abuja"
      }
    },
    {
      id: "6",
      taskId: "TASK006",
      productType: "EAAS RECHARGE",
      warehouse: "Abuja",
      installationAddress: "Abuja",
      status: "COMPLETED",
      createdAt: "2024-07-22T12:32:00Z",
      updatedAt: "2024-07-22T14:30:00Z",
      customer: {
        id: "6",
        firstname: "Lisa",
        lastname: "Davis",
        email: "lisa.davis@example.com",
        phone: "08044332211",
        location: "Abuja"
      }
    },
    {
      id: "7",
      taskId: "TASK007",
      productType: "EAAS RECHARGE",
      warehouse: "Abuja",
      installationAddress: "Abuja",
      status: "COMPLETED",
      createdAt: "2024-07-22T12:32:00Z",
      updatedAt: "2024-07-22T14:30:00Z",
      customer: {
        id: "7",
        firstname: "Tom",
        lastname: "Miller",
        email: "tom.miller@example.com",
        phone: "08033221100",
        location: "Abuja"
      }
    },
    {
      id: "8",
      taskId: "TASK008",
      productType: "EAAS RECHARGE",
      warehouse: "Abuja",
      installationAddress: "Abuja",
      status: "COMPLETED",
      createdAt: "2024-07-22T12:32:00Z",
      updatedAt: "2024-07-22T14:30:00Z",
      customer: {
        id: "8",
        firstname: "Emma",
        lastname: "Garcia",
        email: "emma.garcia@example.com",
        phone: "08022110099",
        location: "Abuja"
      }
    },
    {
      id: "9",
      taskId: "TASK009",
      productType: "EAAS RECHARGE",
      warehouse: "Abuja",
      installationAddress: "Abuja",
      status: "COMPLETED",
      createdAt: "2024-07-22T12:32:00Z",
      updatedAt: "2024-07-22T14:30:00Z",
      customer: {
        id: "9",
        firstname: "Chris",
        lastname: "Rodriguez",
        email: "chris.rodriguez@example.com",
        phone: "08011009988",
        location: "Abuja"
      }
    },
    {
      id: "10",
      taskId: "TASK010",
      productType: "EAAS RECHARGE",
      warehouse: "Abuja",
      installationAddress: "Abuja",
      status: "COMPLETED",
      createdAt: "2024-07-22T12:32:00Z",
      updatedAt: "2024-07-22T14:30:00Z",
      customer: {
        id: "10",
        firstname: "Anna",
        lastname: "Martinez",
        email: "anna.martinez@example.com",
        phone: "08000998877",
        location: "Abuja"
      }
    },
    {
      id: "11",
      taskId: "TASK011",
      productType: "EAAS RECHARGE",
      warehouse: "Abuja",
      installationAddress: "Abuja",
      status: "COMPLETED",
      createdAt: "2024-07-22T12:32:00Z",
      updatedAt: "2024-07-22T14:30:00Z",
      customer: {
        id: "11",
        firstname: "Paul",
        lastname: "Anderson",
        email: "paul.anderson@example.com",
        phone: "08099887766",
        location: "Abuja"
      }
    },
    {
      id: "12",
      taskId: "TASK012",
      productType: "EAAS RECHARGE",
      warehouse: "Abuja",
      installationAddress: "Abuja",
      status: "COMPLETED",
      createdAt: "2024-07-22T12:32:00Z",
      updatedAt: "2024-07-22T14:30:00Z",
      customer: {
        id: "12",
        firstname: "Maria",
        lastname: "Taylor",
        email: "maria.taylor@example.com",
        phone: "08088776655",
        location: "Abuja"
      }
    },
    {
      id: "13",
      taskId: "TASK013",
      productType: "EAAS RECHARGE",
      warehouse: "Abuja",
      installationAddress: "Abuja",
      status: "COMPLETED",
      createdAt: "2024-07-22T12:32:00Z",
      updatedAt: "2024-07-22T14:30:00Z",
      customer: {
        id: "13",
        firstname: "James",
        lastname: "Thomas",
        email: "james.thomas@example.com",
        phone: "08077665544",
        location: "Abuja"
      }
    },
    {
      id: "14",
      taskId: "TASK014",
      productType: "EAAS RECHARGE",
      warehouse: "Abuja",
      installationAddress: "Abuja",
      status: "COMPLETED",
      createdAt: "2024-07-22T12:32:00Z",
      updatedAt: "2024-07-22T14:30:00Z",
      customer: {
        id: "14",
        firstname: "Jennifer",
        lastname: "Hernandez",
        email: "jennifer.hernandez@example.com",
        phone: "08066554433",
        location: "Abuja"
      }
    },
    {
      id: "15",
      taskId: "TASK015",
      productType: "EAAS RECHARGE",
      warehouse: "Abuja",
      installationAddress: "Abuja",
      status: "COMPLETED",
      createdAt: "2024-07-22T12:32:00Z",
      updatedAt: "2024-07-22T14:30:00Z",
      customer: {
        id: "15",
        firstname: "Robert",
        lastname: "Moore",
        email: "robert.moore@example.com",
        phone: "08055443322",
        location: "Abuja"
      }
    }
  ]
}; 