import {
    List,
    Table,
    TextField,
    useTable,
    IResourceComponentsProps,
    Space,
    EditButton,
    ShowButton,
    useMany,
    useSelect,
    Form,
    Input,
    Button,
    DatePicker,
    CrudFilters,
    DateField,
    Card,
    Icons,
    Select,
    Tag,
    FormProps,
    Row,
    Col,
} from "@pankod/refine";

import { IPost, ICategory, IPostFilterVariables } from "interfaces";

const { RangePicker } = DatePicker;

export const PostList: React.FC<IResourceComponentsProps> = () => {
    const { tableProps, searchFormProps } = useTable<
        IPost,
        IPostFilterVariables
    >({
        onSearch: (params) => {
            const filters: CrudFilters = [];
            const { q, category, status, createdAt } = params;

            if (q) {
                filters.push({
                    field: "q",
                    operator: "eq",
                    value: q,
                });
            }

            if (category) {
                filters.push({
                    field: "category.id",
                    operator: "eq",
                    value: category,
                });
            }

            if (status) {
                filters.push({
                    field: "status",
                    operator: "eq",
                    value: status,
                });
            }

            if (createdAt) {
                filters.push(
                    {
                        field: "createdAt",
                        operator: "gte",
                        value: createdAt[0].toISOString(),
                    },
                    {
                        field: "createdAt",
                        operator: "lte",
                        value: createdAt[1].toISOString(),
                    },
                );
            }

            return filters;
        },
    });

    const categoryIds =
        tableProps?.dataSource?.map((item) => item.category.id) ?? [];
    const { data, isLoading } = useMany<ICategory>("categories", categoryIds, {
        enabled: categoryIds.length > 0,
    });

    return (
        <Row gutter={[16, 16]}>
            <Col lg={6} xs={24}>
                <Card title="Filters">
                    <Filter formProps={searchFormProps} />
                </Card>
            </Col>
            <Col lg={18} xs={24}>
                <List>
                    <Table {...tableProps} rowKey="id">
                        <Table.Column dataIndex="id" title="ID" />
                        <Table.Column dataIndex="title" title="Title" />
                        <Table.Column
                            dataIndex="status"
                            title="Status"
                            render={(value) => {
                                let color;
                                switch (value) {
                                    case "published":
                                        color = "green";
                                        break;
                                    case "rejected":
                                        color = "red";
                                        break;
                                    case "draft":
                                        color = "blue";
                                        break;
                                    default:
                                        color = "";
                                        break;
                                }
                                return <Tag color={color}>{value}</Tag>;
                            }}
                        />
                        <Table.Column
                            dataIndex="createdAt"
                            title="Created At"
                            render={(value) => (
                                <DateField format="LLL" value={value} />
                            )}
                        />
                        <Table.Column
                            dataIndex={["category", "id"]}
                            key="category.id"
                            title="Category"
                            render={(value) => {
                                if (isLoading) {
                                    return <TextField value="Loading..." />;
                                }

                                return (
                                    <TextField
                                        value={
                                            data?.data.find(
                                                (item) => item.id === value,
                                            )?.title
                                        }
                                    />
                                );
                            }}
                        />
                        <Table.Column<IPost>
                            title="Actions"
                            dataIndex="actions"
                            render={(_, record) => (
                                <Space>
                                    <EditButton
                                        size="small"
                                        recordItemId={record.id}
                                    />
                                    <ShowButton
                                        size="small"
                                        recordItemId={record.id}
                                    />
                                </Space>
                            )}
                        />
                    </Table>
                </List>
            </Col>
        </Row>
    );
};

const Filter: React.FC<{ formProps: FormProps }> = ({ formProps }) => {
    const { selectProps: categorySelectProps } = useSelect<ICategory>({
        resource: "categories",
    });

    return (
        <Form layout="vertical" {...formProps}>
            <Form.Item label="Search" name="q">
                <Input
                    placeholder="ID, Title, Content, etc."
                    prefix={<Icons.SearchOutlined />}
                />
            </Form.Item>
            <Form.Item label="Status" name="status">
                <Select
                    allowClear
                    options={[
                        {
                            label: "Published",
                            value: "published",
                        },
                        {
                            label: "Draft",
                            value: "draft",
                        },
                        {
                            label: "Rejected",
                            value: "rejected",
                        },
                    ]}
                    placeholder="Post Status"
                />
            </Form.Item>
            <Form.Item label="Category" name="category">
                <Select
                    {...categorySelectProps}
                    allowClear
                    placeholder="Search Categories"
                />
            </Form.Item>
            <Form.Item label="Created At" name="createdAt">
                <RangePicker />
            </Form.Item>
            <Form.Item>
                <Button htmlType="submit" type="primary">
                    Filter
                </Button>
            </Form.Item>
        </Form>
    );
};
