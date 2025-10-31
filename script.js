let dados = JSON.parse(localStorage.getItem("faculdadeDados")) || {
  pessoas: [],
  equipamentos: [],
  emprestimos: []
};

function salvar() {
  localStorage.setItem("faculdadeDados", JSON.stringify(dados));
}

function atualizarTabelas() {
  // Pessoas
  const tabelaPessoas = document.getElementById("tabelaPessoas");
  tabelaPessoas.innerHTML = "<tr><th>Nome</th><th>Telefone</th><th>CPF</th><th>Curso</th></tr>";
  dados.pessoas.forEach(p => {
    tabelaPessoas.innerHTML += `<tr><td>${p.nome}</td><td>${p.telefone}</td><td>${p.cpf}</td><td>${p.curso}</td></tr>`;
  });

  // Equipamentos
  const tabelaEquip = document.getElementById("tabelaEquipamentos");
  tabelaEquip.innerHTML = "<tr><th>Nome</th><th>Patrimônio</th><th>Status</th></tr>";
  dados.equipamentos.forEach(e => {
    tabelaEquip.innerHTML += `<tr><td>${e.nome}</td><td>${e.patrimonio}</td><td>${e.status}</td></tr>`;
  });

  // Empréstimos
  const tabelaEmp = document.getElementById("tabelaEmprestimos");
  tabelaEmp.innerHTML = "<tr><th>Equipamento</th><th>Aluno</th><th>Curso</th><th>Status</th><th>Data Empréstimo</th><th>Data Devolução</th></tr>";
  dados.emprestimos.forEach(emp => {
    tabelaEmp.innerHTML += `<tr>
      <td>${emp.equipamento}</td>
      <td>${emp.aluno}</td>
      <td>${emp.curso}</td>
      <td>${emp.status}</td>
      <td>${emp.data_emprestimo}</td>
      <td>${emp.data_devolucao || "---"}</td>
    </tr>`;
  });

  // Atualiza selects
  const alunoSelect = document.getElementById("alunoEmprestimo");
  const equipSelect = document.getElementById("equipEmprestimo");
  const devolucaoSelect = document.getElementById("devolucaoSelect");

  alunoSelect.innerHTML = "<option value=''>Selecione um aluno</option>";
  equipSelect.innerHTML = "<option value=''>Selecione um equipamento</option>";
  devolucaoSelect.innerHTML = "<option value=''>Selecione para devolver</option>";

  dados.pessoas.forEach(p => alunoSelect.innerHTML += `<option>${p.nome}</option>`);
  dados.equipamentos.filter(e => e.status === "No Armário")
                    .forEach(e => equipSelect.innerHTML += `<option>${e.nome}</option>`);
  dados.emprestimos.filter(e => e.status === "Emprestado")
                    .forEach(e => devolucaoSelect.innerHTML += `<option>${e.equipamento} (${e.aluno})</option>`);
}

function registrarPessoa() {
  const nome = document.getElementById("nome").value;
  const telefone = document.getElementById("telefone").value;
  const cpf = document.getElementById("cpf").value;
  const curso = document.getElementById("curso").value;

  if (!nome || !telefone || !cpf || !curso) {
    alert("Preencha todos os campos!");
    return;
  }

  dados.pessoas.push({ nome, telefone, cpf, curso });
  salvar();
  atualizarTabelas();
  alert(`Pessoa '${nome}' registrada com sucesso!`);
}

function registrarEquipamento() {
  const nome = document.getElementById("nomeEquipamento").value;
  const patrimonio = document.getElementById("patrimonio").value;

  if (!nome || !patrimonio) {
    alert("Preencha todos os campos!");
    return;
  }

  dados.equipamentos.push({ nome, patrimonio, status: "No Armário" });
  salvar();
  atualizarTabelas();
  alert(`Equipamento '${nome}' registrado com sucesso!`);
}

function registrarEmprestimo() {
  const aluno = document.getElementById("alunoEmprestimo").value;
  const equipamento = document.getElementById("equipEmprestimo").value;

  if (!aluno || !equipamento) {
    alert("Selecione um aluno e um equipamento!");
    return;
  }

  const pessoa = dados.pessoas.find(p => p.nome === aluno);
  const eqp = dados.equipamentos.find(e => e.nome === equipamento);

  if (eqp.status === "Emprestado") {
    alert("Este equipamento já está emprestado!");
    return;
  }

  eqp.status = "Emprestado";
  const data = new Date().toLocaleString("pt-BR");
  dados.emprestimos.push({
    aluno,
    curso: pessoa.curso,
    equipamento,
    status: "Emprestado",
    data_emprestimo: data,
    data_devolucao: ""
  });

  salvar();
  atualizarTabelas();
  alert(`Equipamento '${equipamento}' emprestado a ${aluno}!`);
}

function registrarDevolucao() {
  const selecionado = document.getElementById("devolucaoSelect").value;
  if (!selecionado) {
    alert("Selecione um empréstimo!");
    return;
  }

  const [equipamento] = selecionado.split(" (");
  const emp = dados.emprestimos.find(e => e.equipamento === equipamento.trim() && e.status === "Emprestado");
  const eqp = dados.equipamentos.find(e => e.nome === equipamento.trim());

  emp.status = "Devolvido";
  emp.data_devolucao = new Date().toLocaleString("pt-BR");
  eqp.status = "No Armário";

  salvar();
  atualizarTabelas();
  alert(`Equipamento '${equipamento}' devolvido com sucesso!`);
}

function mostrarAba(nome) {
  document.querySelectorAll(".tab, .tab-content").forEach(el => el.classList.remove("active"));
  document.querySelector(`.tab[onclick*="${nome}"]`).classList.add("active");
  document.getElementById(nome).classList.add("active");
}

atualizarTabelas();
