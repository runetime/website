@extends('layouts.default')
@section('contents')
            <div class='wrapper'>
                <h1>
                    @lang('database.monsters.create.title')
                </h1>
                <p class='text-info'>
                    @lang('database.create_note')
                </p>
                <form action='' method='post' class='form-horizontal' role='form'>
                    <div class='form-group'>
                        <label class='col-lg-2 control-label' for='name'>
                            @lang('database.monsters.view.name')
                        </label>
                        <div class='col-lg-10'>
                            <input id='name' class='form-control' type='text' name='name' required />
                        </div>
                    </div>
                    <div class='form-group'>
                        <label class='col-lg-2 control-label' for='examine'>
                            @lang('database.monsters.view.examine')
                        </label>
                        <div class='col-lg-10'>
                            <input id='examine' class='form-control' type='text' name='examine' required />
                        </div>
                    </div>
                    <div class='form-group'>
                        <label class='col-lg-2 control-label' for='stats'>
                            @lang('database.monsters.view.stats')
                        </label>
                        <div class='col-lg-10'>
                            <textarea name='stats' id='stats' class='form-control' rows='10' required></textarea>
                        </div>
                    </div>
                    <div class='form-group'>
                        <label class='col-lg-2 control-label' for='location'>
                            @lang('database.monsters.view.location')
                        </label>
                        <div class='col-lg-10'>
                            <textarea name='location' id='location' class='form-control' rows='10' required></textarea>
                        </div>
                    </div>
                    <div class='form-group'>
                        <label class='col-lg-2 control-label' for='drops'>
                            @lang('database.monsters.view.drops')
                        </label>
                        <div class='col-lg-10'>
                            <textarea name='drops' id='drops' class='form-control' rows='10' required></textarea>
                        </div>
                    </div>
                    <div class='form-group'>
                        <label class='col-lg-2 control-label' for='membership'>
                            @lang('database.monsters.view.membership')
                        </label>
                        <div class='col-lg-10'>
                            <div class='radio'>
                                <label>
                                    <input type='radio' name='membership' value='0' checked />
                                    @lang('utilities.membership.free')
                                </label>
                            </div>
                            <div class='radio'>
                                <label>
                                    <input type='radio' name='membership' value='1' />
                                    @lang('utilities.membership.members')
                                </label>
                            </div>
                        </div>
                    </div>
                    <div class='form-group'>
                        <label class='col-lg-2 control-label' for='other_information'>
                            @lang('database.monsters.view.other_information')
                        </label>
                        <div class='col-lg-10'>
                            <textarea name='other_information' id='other_information' class='form-control' rows='10' required></textarea>
                        </div>
                    </div>
                    <div class='form-group'>
                        <div class='col-lg-offset-2 col-lg-10'>
                            <button class='btn btn-primary' type='submit'>
                                @lang('database.monsters.create.submit')
                            </button>
                        </div>
                    </div>
                </form>
            </div>
@stop
